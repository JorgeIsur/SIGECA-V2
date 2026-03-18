import { Module } from '@nestjs/common';
import { SalonesService } from './salones.service';
import { SalonesController } from './salones.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SalonesService],
  controllers: [SalonesController],
  exports: [SalonesService],
})
export class SalonesModule {}
