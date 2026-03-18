import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalonDto } from './dto/create-salon.dto';
import { UpdateSalonDto } from './dto/update-salon.dto';

@Injectable()
export class SalonesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.salon.findMany({
      where: { disponible: true },
      orderBy: [{ edificio: 'asc' }, { nombre: 'asc' }],
    });
  }

  async findOne(id: number) {
    const salon = await this.prisma.salon.findUnique({
      where: { id },
    });

    if (!salon) {
      throw new NotFoundException(`Salón #${id} no encontrado`);
    }

    return salon;
  }

  async create(dto: CreateSalonDto) {
    const existe = await this.prisma.salon.findUnique({
      where: {
        nombre_edificio: {
          nombre: dto.nombre,
          edificio: dto.edificio ?? '',
        },
      },
    });

    if (existe) {
      throw new ConflictException('Ya existe un salón con ese nombre en ese edificio');
    }

    return this.prisma.salon.create({ data: dto });
  }

  async update(id: number, dto: UpdateSalonDto) {
    await this.findOne(id);

    return this.prisma.salon.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.salon.update({
      where: { id },
      data: { disponible: false },
      select: { id: true, disponible: true },
    });
  }
}
