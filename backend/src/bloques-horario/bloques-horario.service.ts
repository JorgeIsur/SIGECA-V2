import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBloqueDto } from './dto/create-bloque.dto';
import { UpdateBloqueDto } from './dto/update-bloque.dto';

@Injectable()
export class BloquesHorarioService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.bloqueHorario.findMany({
      orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
    });
  }

  async findOne(id: number) {
    const bloque = await this.prisma.bloqueHorario.findUnique({
      where: { id },
    });

    if (!bloque) {
      throw new NotFoundException(`Bloque horario #${id} no encontrado`);
    }

    return bloque;
  }

  async create(dto: CreateBloqueDto) {
    const existe = await this.prisma.bloqueHorario.findUnique({
      where: {
        diaSemana_horaInicio: {
          diaSemana: dto.diaSemana,
          horaInicio: dto.horaInicio,
        },
      },
    });

    if (existe) {
      throw new ConflictException('Ya existe un bloque en ese día y hora');
    }

    return this.prisma.bloqueHorario.create({ data: dto });
  }

  async update(id: number, dto: UpdateBloqueDto) {
    await this.findOne(id);

    return this.prisma.bloqueHorario.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.bloqueHorario.delete({
      where: { id },
    });
  }
}
