import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AsignacionPendiente,
  AsignacionRealizada,
  EstadoScheduling,
  ResultadoScheduling,
} from './types/scheduling.types';

@Injectable()
export class SchedulingService {
  constructor(private prisma: PrismaService) {}

  async generarHorario(periodoId: number): Promise<ResultadoScheduling> {
    const periodo = await this.prisma.periodoEscolar.findUnique({
      where: { id: periodoId },
    });

    if (!periodo) {
      throw new BadRequestException('Periodo escolar no encontrado');
    }

    const [grupos, salones, bloques] = await Promise.all([
      this.prisma.grupo.findMany({
        where: { periodoId },
        include: {
          materias: {
            include: {
              materia: {
                include: {
                  profesores: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.salon.findMany({ where: { disponible: true } }),
      this.prisma.bloqueHorario.findMany({
        orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
      }),
    ]);

    const disponibilidades = await this.prisma.disponibilidadProfesor.findMany({
      where: { periodoId, disponible: true },
    });

    const disponibilidadMap = new Map<string, boolean>();
    disponibilidades.forEach((d) => {
      disponibilidadMap.set(`${d.profesorId}-${d.bloqueId}`, true);
    });

    const pendientes: AsignacionPendiente[] = [];

    for (const grupo of grupos) {
      for (const mg of grupo.materias) {
        const profesoresHabilitados = mg.materia.profesores.map(
          (mp) => mp.profesorId,
        );

        if (profesoresHabilitados.length === 0) continue;

        for (let h = 0; h < mg.materia.horasSemanales; h++) {
          pendientes.push({
            grupoId: grupo.id,
            materiaId: mg.materia.id,
            profesoresHabilitados,
            horasRestantes: mg.materia.horasSemanales,
          });
        }
      }
    }

    if (pendientes.length === 0) {
      return {
        exito: false,
        asignaciones: [],
        mensaje: 'No hay materias asignadas a los grupos de este periodo',
        totalAsignaciones: 0,
      };
    }

    const estado: EstadoScheduling = {
      asignaciones: [],
      profesorOcupado: new Map(),
      salonOcupado: new Map(),
      grupoOcupado: new Map(),
    };

    const exito = this.backtrack(
      pendientes,
      0,
      estado,
      salones,
      bloques,
      disponibilidadMap,
      periodoId,
    );

    if (!exito) {
      return {
        exito: false,
        asignaciones: [],
        mensaje:
          'No fue posible generar un horario válido. Verifica disponibilidades, salones y asignaciones de profesores.',
        totalAsignaciones: 0,
      };
    }

    await this.prisma.asignacion.deleteMany({ where: { periodoId, estado: 'PROPUESTA' } });

    await this.prisma.asignacion.createMany({
      data: estado.asignaciones,
    });

    return {
      exito: true,
      asignaciones: estado.asignaciones,
      mensaje: `Horario generado exitosamente con ${estado.asignaciones.length} asignaciones`,
      totalAsignaciones: estado.asignaciones.length,
    };
  }

  private backtrack(
    pendientes: AsignacionPendiente[],
    indice: number,
    estado: EstadoScheduling,
    salones: any[],
    bloques: any[],
    disponibilidadMap: Map<string, boolean>,
    periodoId: number,
  ): boolean {
    if (indice === pendientes.length) return true;

    const pendiente = pendientes[indice];

    for (const bloqueId of bloques.map((b) => b.id)) {
      const claveGrupo = `${pendiente.grupoId}-${bloqueId}`;
      if (estado.grupoOcupado.get(claveGrupo)) continue;

      for (const profesorId of pendiente.profesoresHabilitados) {
        const claveProfesor = `${profesorId}-${bloqueId}`;
        if (estado.profesorOcupado.get(claveProfesor)) continue;

        if (!disponibilidadMap.get(`${profesorId}-${bloqueId}`)) continue;

        for (const salon of salones) {
          const claveSalon = `${salon.id}-${bloqueId}`;
          if (estado.salonOcupado.get(claveSalon)) continue;

          const asignacion: AsignacionRealizada = {
            profesorId,
            materiaId: pendiente.materiaId,
            grupoId: pendiente.grupoId,
            salonId: salon.id,
            bloqueId,
            periodoId,
          };

          estado.asignaciones.push(asignacion);
          estado.profesorOcupado.set(claveProfesor, true);
          estado.salonOcupado.set(claveSalon, true);
          estado.grupoOcupado.set(claveGrupo, true);

          if (
            this.backtrack(
              pendientes,
              indice + 1,
              estado,
              salones,
              bloques,
              disponibilidadMap,
              periodoId,
            )
          ) {
            return true;
          }

          estado.asignaciones.pop();
          estado.profesorOcupado.delete(claveProfesor);
          estado.salonOcupado.delete(claveSalon);
          estado.grupoOcupado.delete(claveGrupo);
        }
      }
    }

    return false;
  }

  async obtenerHorario(periodoId: number) {
    return this.prisma.asignacion.findMany({
      where: { periodoId },
      include: {
        profesor: true,
        materia: true,
        grupo: true,
        salon: true,
        bloque: true,
      },
      orderBy: [
        { bloque: { diaSemana: 'asc' } },
        { bloque: { horaInicio: 'asc' } },
      ],
    });
  }

  async limpiarHorario(periodoId: number) {
    return this.prisma.asignacion.deleteMany({
      where: { periodoId, estado: 'PROPUESTA' },
    });
  }

  async diagnosticar(periodoId: number) {
    const grupos = await this.prisma.grupo.findMany({
      where: { periodoId },
      include: {
        materias: {
          include: {
            materia: {
              include: { profesores: true },
            },
          },
        },
      },
    });

    const disponibilidades = await this.prisma.disponibilidadProfesor.findMany({
      where: { periodoId, disponible: true },
    });

    const salones = await this.prisma.salon.findMany({
      where: { disponible: true },
    });

    const bloques = await this.prisma.bloqueHorario.findMany();

    return {
      totalGrupos: grupos.length,
      totalSalones: salones.length,
      totalBloques: bloques.length,
      totalDisponibilidades: disponibilidades.length,
      grupos: grupos.map((g) => ({
        id: g.id,
        nombre: g.nombre,
        totalMaterias: g.materias.length,
        materias: g.materias.map((mg) => ({
          materia: mg.materia.nombre,
          horasSemanales: mg.materia.horasSemanales,
          profesoresHabilitados: mg.materia.profesores.length,
          profesores: mg.materia.profesores.map((mp) => mp.profesorId),
        })),
      })),
      disponibilidadesPorProfesor: disponibilidades.reduce((acc, d) => {
        acc[d.profesorId] = (acc[d.profesorId] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
    };
  }
}
