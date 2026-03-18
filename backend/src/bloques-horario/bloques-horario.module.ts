import { Module } from '@nestjs/common';
import { BloquesHorarioService } from './bloques-horario.service';
import { BloquesHorarioController } from './bloques-horario.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BloquesHorarioService],
  controllers: [BloquesHorarioController],
  exports: [BloquesHorarioService],
})
export class BloquesHorarioModule {}
