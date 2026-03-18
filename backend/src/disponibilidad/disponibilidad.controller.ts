import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { DisponibilidadService } from './disponibilidad.service';
import { CreateDisponibilidadDto } from './dto/create-disponibilidad.dto';
import { UpdateDisponibilidadDto } from './dto/update-disponibilidad.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@UseGuards(JwtGuard, RolesGuard)
@Controller('disponibilidad')
export class DisponibilidadController {
  constructor(private disponibilidad: DisponibilidadService) {}

  @Roles('ADMIN', 'COORDINADOR')
  @Get('profesor/:profesorId/periodo/:periodoId')
  findByProfesorYPeriodo(
    @Param('profesorId', ParseIntPipe) profesorId: number,
    @Param('periodoId', ParseIntPipe) periodoId: number,
  ) {
    return this.disponibilidad.findByProfesorYPeriodo(profesorId, periodoId);
  }

  @Roles('ADMIN', 'COORDINADOR')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.disponibilidad.findOne(id);
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateDisponibilidadDto) {
    return this.disponibilidad.create(dto);
  }

  @Roles('ADMIN')
  @Post('masivo')
  createMasivo(
    @Body() body: { profesorId: number; periodoId: number; bloqueIds: number[] },
  ) {
    return this.disponibilidad.createMasivo(
      body.profesorId,
      body.periodoId,
      body.bloqueIds,
    );
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDisponibilidadDto,
  ) {
    return this.disponibilidad.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.disponibilidad.remove(id);
  }
}
