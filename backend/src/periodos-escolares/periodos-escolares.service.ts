import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePeriodoDto } from './dto/create-periodo.dto';
import { UpdatePeriodoDto } from './dto/update-periodo.dto';

@Injectable()
export class PeriodosEscolaresService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.periodoEscolar.findMany({
      orderBy: { fechaInicio: 'desc' },
    });
  }

  async findOne(id: number) {
    const periodo = await this.prisma.periodoEscolar.findUnique({
      where: { id },
      include: {
        grupos: true,
      },
    });

    if (!periodo) {
      throw new NotFoundException(`Periodo #${id} no encontrado`);
    }

    return periodo;
  }

  async findActivo() {
    const periodo = await this.prisma.periodoEscolar.findFirst({
      where: { activo: true },
    });

    if (!periodo) {
      throw new NotFoundException('No hay ningún periodo escolar activo');
    }

    return periodo;
  }

  async create(dto: CreatePeriodoDto) {
    const existe = await this.prisma.periodoEscolar.findFirst({
      where: { nombre: dto.nombre },
    });

    if (existe) {
      throw new ConflictException(`Ya existe un periodo con el nombre ${dto.nombre}`);
    }

    return this.prisma.periodoEscolar.create({
      data: {
        nombre: dto.nombre,
        fechaInicio: new Date(dto.fechaInicio),
        fechaFin: new Date(dto.fechaFin),
      },
    });
  }

  async update(id: number, dto: UpdatePeriodoDto) {
    await this.findOne(id);

    if (dto.activo === true) {
      await this.prisma.periodoEscolar.updateMany({
        where: { activo: true },
        data: { activo: false },
      });
    }

    return this.prisma.periodoEscolar.update({
      where: { id },
      data: {
        ...dto,
        fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.periodoEscolar.delete({
      where: { id },
    });
  }
}
