import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SalonesService } from './salones.service';
import { CreateSalonDto } from './dto/create-salon.dto';
import { UpdateSalonDto } from './dto/update-salon.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@UseGuards(JwtGuard, RolesGuard)
@Controller('salones')
export class SalonesController {
  constructor(private salones: SalonesService) {}

  @Roles('ADMIN', 'COORDINADOR')
  @Get()
  findAll() {
    return this.salones.findAll();
  }

  @Roles('ADMIN', 'COORDINADOR')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salones.findOne(id);
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateSalonDto) {
    return this.salones.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSalonDto) {
    return this.salones.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.salones.remove(id);
  }
}
