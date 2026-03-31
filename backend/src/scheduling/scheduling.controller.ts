import { Controller, Post, Get, Delete, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@UseGuards(JwtGuard, RolesGuard)
@Controller('scheduling')
export class SchedulingController {
  constructor(private scheduling: SchedulingService) {}

  @Roles('ADMIN')
  @Post('generar/:periodoId')
  generar(@Param('periodoId', ParseIntPipe) periodoId: number) {
    return this.scheduling.generarHorario(periodoId);
  }

  @Roles('ADMIN', 'COORDINADOR', 'PROFESOR')
  @Get('horario/:periodoId')
  obtener(@Param('periodoId', ParseIntPipe) periodoId: number) {
    return this.scheduling.obtenerHorario(periodoId);
  }

  @Roles('ADMIN')
  @Delete('limpiar/:periodoId')
  limpiar(@Param('periodoId', ParseIntPipe) periodoId: number) {
    return this.scheduling.limpiarHorario(periodoId);
  }

  @Roles('ADMIN')
  @Get('diagnosticar/:periodoId')
  diagnosticar(@Param('periodoId', ParseIntPipe) periodoId: number) {
    return this.scheduling.diagnosticar(periodoId);
  }
}
