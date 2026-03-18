import { Module } from '@nestjs/common';
import { ProfesoresService } from './profesores.service';
import { ProfesoresController } from './profesores.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ProfesoresService],
  controllers: [ProfesoresController],
  exports: [ProfesoresService],
})
export class ProfesoresModule {}
