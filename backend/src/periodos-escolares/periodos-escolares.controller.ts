import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PeriodosEscolaresService } from './periodos-escolares.service';
import { CreatePeriodoDto } from './dto/create-periodo.dto';
import { UpdatePeriodoDto } from './dto/update-periodo.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@UseGuards(JwtGuard, RolesGuard)
@Controller('periodos-escolares')
export class PeriodosEscolaresController {
  constructor(private periodos: PeriodosEscolaresService) {}

  @Roles('ADMIN', 'COORDINADOR')
  @Get()
  findAll() {
    return this.periodos.findAll();
  }

  @Roles('ADMIN', 'COORDINADOR')
  @Get('activo')
  findActivo() {
    return this.periodos.findActivo();
  }

  @Roles('ADMIN', 'COORDINADOR')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.periodos.findOne(id);
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreatePeriodoDto) {
    return this.periodos.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePeriodoDto) {
    return this.periodos.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.periodos.remove(id);
  }
}
