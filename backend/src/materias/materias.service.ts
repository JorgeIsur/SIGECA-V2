import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMateriaDto } from './dto/create-materia.dto';
import { UpdateMateriaDto } from './dto/update-materia.dto';

@Injectable()
export class MateriasService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.materia.findMany({
      where: { activa: true },
      orderBy: [{ carrera: 'asc' }, { semestre: 'asc' }, { nombre: 'asc' }],
    });
  }

  async findOne(id: number) {
    const materia = await this.prisma.materia.findUnique({
      where: { id },
      include: {
        profesores: {
          include: { profesor: true },
        },
      },
    });

    if (!materia) {
      throw new NotFoundException(`Materia #${id} no encontrada`);
    }

    return materia;
  }

  async create(dto: CreateMateriaDto) {
    const existe = await this.prisma.materia.findUnique({
      where: { clave: dto.clave },
    });

    if (existe) {
      throw new ConflictException(`Ya existe una materia con la clave ${dto.clave}`);
    }

    return this.prisma.materia.create({ data: dto });
  }

  async update(id: number, dto: UpdateMateriaDto) {
    await this.findOne(id);

    return this.prisma.materia.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.materia.update({
      where: { id },
      data: { activa: false },
      select: { id: true, activa: true },
    });
  }

  async asignarProfesor(materiaId: number, profesorId: number) {
    const existe = await this.prisma.materiaProfesor.findUnique({
      where: { profesorId_materiaId: { profesorId, materiaId } },
    });

    if (existe) {
      throw new ConflictException('El profesor ya está asignado a esta materia');
    }

    return this.prisma.materiaProfesor.create({
      data: { materiaId, profesorId },
    });
  }

  async desasignarProfesor(materiaId: number, profesorId: number) {
    return this.prisma.materiaProfesor.delete({
      where: { profesorId_materiaId: { profesorId, materiaId } },
    });
  }
}
