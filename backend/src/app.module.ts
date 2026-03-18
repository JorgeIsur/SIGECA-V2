import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ProfesoresModule } from './profesores/profesores.module';
import { MateriasModule } from './materias/materias.module';
import { SalonesModule } from './salones/salones.module';
import { BloquesHorarioModule } from './bloques-horario/bloques-horario.module';
import { PeriodosEscolaresModule } from './periodos-escolares/periodos-escolares.module';
import { GruposModule } from './grupos/grupos.module';
import { DisponibilidadModule } from './disponibilidad/disponibilidad.module';

@Module({
  imports: [PrismaModule, AuthModule, UsuariosModule, ProfesoresModule, MateriasModule, SalonesModule, BloquesHorarioModule, PeriodosEscolaresModule, GruposModule, DisponibilidadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
