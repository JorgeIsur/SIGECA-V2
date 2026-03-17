import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        profesorId: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        profesorId: true,
        createdAt: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario #${id} no encontrado`);
    }

    return usuario;
  }

  async create(dto: CreateUsuarioDto) {
    const existe = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (existe) {
      throw new ConflictException('El email ya está registrado');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    return this.prisma.usuario.create({
      data: {
        nombre: dto.nombre,
        email: dto.email,
        password: hash,
        rol: dto.rol,
        profesorId: dto.profesorId,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        profesorId: true,
        createdAt: true,
      },
    });
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    await this.findOne(id);

    return this.prisma.usuario.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        profesorId: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.usuario.update({
      where: { id },
      data: { activo: false },
      select: { id: true, activo: true },
    });
  }
}
