import { Module } from '@nestjs/common';
import { MateriasService } from './materias.service';
import { MateriasController } from './materias.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MateriasService],
  controllers: [MateriasController],
  exports: [MateriasService],
})
export class MateriasModule {}
