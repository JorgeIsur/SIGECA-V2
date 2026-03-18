export class CreateGrupoDto {
  nombre: string;
  semestre: number;
  carrera: string;
  cupo?: number;
  periodoId: number;
}
