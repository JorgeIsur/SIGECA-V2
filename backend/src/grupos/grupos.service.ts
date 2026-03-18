import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';

@Injectable()
export class GruposService {
  constructor(private prisma: PrismaService) {}

  async findAll(periodoId?: number) {
    return this.prisma.grupo.findMany({
      where: periodoId ? { periodoId } : undefined,
      orderBy: [{ carrera: 'asc' }, { semestre: 'asc' }, { nombre: 'asc' }],
      include: { periodo: true },
    });
  }

  async findOne(id: number) {
    const grupo = await this.prisma.grupo.findUnique({
      where: { id },
      include: {
        periodo: true,
        materias: {
          include: { materia: true },
        },
      },
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo #${id} no encontrado`);
    }

    return grupo;
  }

  async create(dto: CreateGrupoDto) {
    const existe = await this.prisma.grupo.findUnique({
      where: {
        nombre_periodoId: {
          nombre: dto.nombre,
          periodoId: dto.periodoId,
        },
      },
    });

    if (existe) {
      throw new ConflictException('Ya existe un grupo con ese nombre en este periodo');
    }

    return this.prisma.grupo.create({
      data: dto,
      include: { periodo: true },
    });
  }

  async update(id: number, dto: UpdateGrupoDto) {
    await this.findOne(id);

    return this.prisma.grupo.update({
      where: { id },
      data: dto,
      include: { periodo: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.grupo.delete({
      where: { id },
    });
  }

  async asignarMateria(grupoId: number, materiaId: number) {
    const existe = await this.prisma.materiaGrupo.findUnique({
      where: { materiaId_grupoId: { materiaId, grupoId } },
    });

    if (existe) {
      throw new ConflictException('La materia ya está asignada a este grupo');
    }

    return this.prisma.materiaGrupo.create({
      data: { grupoId, materiaId },
    });
  }

  async desasignarMateria(grupoId: number, materiaId: number) {
    return this.prisma.materiaGrupo.delete({
      where: { materiaId_grupoId: { materiaId, grupoId } },
    });
  }
}
