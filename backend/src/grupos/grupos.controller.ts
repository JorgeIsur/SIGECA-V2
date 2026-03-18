import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { GruposService } from './grupos.service';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@UseGuards(JwtGuard, RolesGuard)
@Controller('grupos')
export class GruposController {
  constructor(private grupos: GruposService) {}

  @Roles('ADMIN', 'COORDINADOR')
  @Get()
  findAll(@Query('periodoId') periodoId?: string) {
    return this.grupos.findAll(periodoId ? parseInt(periodoId) : undefined);
  }

  @Roles('ADMIN', 'COORDINADOR')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.grupos.findOne(id);
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateGrupoDto) {
    return this.grupos.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGrupoDto) {
    return this.grupos.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.grupos.remove(id);
  }

  @Roles('ADMIN')
  @Post(':id/materias/:materiaId')
  asignarMateria(
    @Param('id', ParseIntPipe) id: number,
    @Param('materiaId', ParseIntPipe) materiaId: number,
  ) {
    return this.grupos.asignarMateria(id, materiaId);
  }

  @Roles('ADMIN')
  @Delete(':id/materias/:materiaId')
  desasignarMateria(
    @Param('id', ParseIntPipe) id: number,
    @Param('materiaId', ParseIntPipe) materiaId: number,
  ) {
    return this.grupos.desasignarMateria(id, materiaId);
  }
}
