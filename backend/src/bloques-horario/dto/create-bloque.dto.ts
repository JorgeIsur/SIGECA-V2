export class CreateBloqueDto {
  diaSemana: 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO';
  horaInicio: string;
  horaFin: string;
  duracionMin?: number;
}
