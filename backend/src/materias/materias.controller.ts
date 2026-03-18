import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { MateriasService } from './materias.service';
import { CreateMateriaDto } from './dto/create-materia.dto';
import { UpdateMateriaDto } from './dto/update-materia.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@UseGuards(JwtGuard, RolesGuard)
@Controller('materias')
export class MateriasController {
  constructor(private materias: MateriasService) {}

  @Roles('ADMIN', 'COORDINADOR')
  @Get()
  findAll() {
    return this.materias.findAll();
  }

  @Roles('ADMIN', 'COORDINADOR')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.materias.findOne(id);
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateMateriaDto) {
    return this.materias.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMateriaDto) {
    return this.materias.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.materias.remove(id);
  }

  @Roles('ADMIN')
  @Post(':id/profesores/:profesorId')
  asignarProfesor(
    @Param('id', ParseIntPipe) id: number,
    @Param('profesorId', ParseIntPipe) profesorId: number,
  ) {
    return this.materias.asignarProfesor(id, profesorId);
  }

  @Roles('ADMIN')
  @Delete(':id/profesores/:profesorId')
  desasignarProfesor(
    @Param('id', ParseIntPipe) id: number,
    @Param('profesorId', ParseIntPipe) profesorId: number,
  ) {
    return this.materias.desasignarProfesor(id, profesorId);
  }
}
