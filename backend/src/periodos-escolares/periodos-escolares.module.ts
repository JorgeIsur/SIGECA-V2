import { Module } from '@nestjs/common';
import { PeriodosEscolaresService } from './periodos-escolares.service';
import { PeriodosEscolaresController } from './periodos-escolares.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PeriodosEscolaresService],
  controllers: [PeriodosEscolaresController],
  exports: [PeriodosEscolaresService],
})
export class PeriodosEscolaresModule {}
