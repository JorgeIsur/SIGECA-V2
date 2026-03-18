import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ProfesoresService } from './profesores.service';
import { CreateProfesorDto } from './dto/create-profesor.dto';
import { UpdateProfesorDto } from './dto/update-profesor.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@UseGuards(JwtGuard, RolesGuard)
@Controller('profesores')
export class ProfesoresController {
  constructor(private profesores: ProfesoresService) {}

  @Roles('ADMIN', 'COORDINADOR')
  @Get()
  findAll() {
    return this.profesores.findAll();
  }

  @Roles('ADMIN', 'COORDINADOR')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.profesores.findOne(id);
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateProfesorDto) {
    return this.profesores.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProfesorDto) {
    return this.profesores.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.profesores.remove(id);
  }
}
