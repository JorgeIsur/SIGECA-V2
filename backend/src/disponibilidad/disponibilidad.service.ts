import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDisponibilidadDto } from './dto/create-disponibilidad.dto';
import { UpdateDisponibilidadDto } from './dto/update-disponibilidad.dto';

@Injectable()
export class DisponibilidadService {
  constructor(private prisma: PrismaService) {}

  async findByProfesorYPeriodo(profesorId: number, periodoId: number) {
    return this.prisma.disponibilidadProfesor.findMany({
      where: { profesorId, periodoId },
      include: { bloque: true },
      orderBy: {
        bloque: { horaInicio: 'asc' },
      },
    });
  }

  async findOne(id: number) {
    const disponibilidad = await this.prisma.disponibilidadProfesor.findUnique({
      where: { id },
      include: { bloque: true, profesor: true },
    });

    if (!disponibilidad) {
      throw new NotFoundException(`Disponibilidad #${id} no encontrada`);
    }

    return disponibilidad;
  }

  async create(dto: CreateDisponibilidadDto) {
    const existe = await this.prisma.disponibilidadProfesor.findUnique({
      where: {
        profesorId_bloqueId_periodoId: {
          profesorId: dto.profesorId,
          bloqueId: dto.bloqueId,
          periodoId: dto.periodoId,
        },
      },
    });

    if (existe) {
      throw new ConflictException('Ya existe disponibilidad para ese profesor en ese bloque y periodo');
    }

    return this.prisma.disponibilidadProfesor.create({
      data: {
        profesorId: dto.profesorId,
        bloqueId: dto.bloqueId,
        periodoId: dto.periodoId,
        disponible: dto.disponible ?? true,
      },
      include: { bloque: true },
    });
  }

  async createMasivo(profesorId: number, periodoId: number, bloqueIds: number[]) {
    const registros = bloqueIds.map((bloqueId) => ({
      profesorId,
      bloqueId,
      periodoId,
      disponible: true,
    }));

    return this.prisma.disponibilidadProfesor.createMany({
      data: registros,
      skipDuplicates: true,
    });
  }

  async update(id: number, dto: UpdateDisponibilidadDto) {
    await this.findOne(id);

    return this.prisma.disponibilidadProfesor.update({
      where: { id },
      data: dto,
      include: { bloque: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.disponibilidadProfesor.delete({
      where: { id },
    });
  }
}
