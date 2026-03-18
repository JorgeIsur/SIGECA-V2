import { Module } from '@nestjs/common';
import { DisponibilidadService } from './disponibilidad.service';
import { DisponibilidadController } from './disponibilidad.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DisponibilidadService],
  controllers: [DisponibilidadController],
  exports: [DisponibilidadService],
})
export class DisponibilidadModule {}
