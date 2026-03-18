import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfesorDto } from './dto/create-profesor.dto';
import { UpdateProfesorDto } from './dto/update-profesor.dto';

@Injectable()
export class ProfesoresService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.profesor.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const profesor = await this.prisma.profesor.findUnique({
      where: { id },
      include: {
        materias: {
          include: { materia: true },
        },
      },
    });

    if (!profesor) {
      throw new NotFoundException(`Profesor #${id} no encontrado`);
    }

    return profesor;
  }

  async create(dto: CreateProfesorDto) {
    const existe = await this.prisma.profesor.findFirst({
      where: { email: dto.email },
    });

    if (existe) {
      throw new ConflictException('Ya existe un profesor con ese email');
    }

    return this.prisma.profesor.create({
      data: dto,
    });
  }

  async update(id: number, dto: UpdateProfesorDto) {
    await this.findOne(id);

    return this.prisma.profesor.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.profesor.update({
      where: { id },
      data: { activo: false },
      select: { id: true, activo: true },
    });
  }
}
