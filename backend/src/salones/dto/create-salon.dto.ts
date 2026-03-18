export class CreateSalonDto {
  nombre: string;
  edificio?: string;
  capacidad: number;
  tipo?: 'AULA' | 'LABORATORIO' | 'SALA_COMPUTO' | 'AUDITORIO' | 'TALLER';
}
