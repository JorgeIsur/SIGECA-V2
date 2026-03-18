import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { BloquesHorarioService } from './bloques-horario.service';
import { CreateBloqueDto } from './dto/create-bloque.dto';
import { UpdateBloqueDto } from './dto/update-bloque.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@UseGuards(JwtGuard, RolesGuard)
@Controller('bloques-horario')
export class BloquesHorarioController {
  constructor(private bloques: BloquesHorarioService) {}

  @Roles('ADMIN', 'COORDINADOR')
  @Get()
  findAll() {
    return this.bloques.findAll();
  }

  @Roles('ADMIN', 'COORDINADOR')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bloques.findOne(id);
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateBloqueDto) {
    return this.bloques.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBloqueDto) {
    return this.bloques.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bloques.remove(id);
  }
}
