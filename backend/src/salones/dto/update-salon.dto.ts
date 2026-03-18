export class UpdateSalonDto {
  nombre?: string;
  edificio?: string;
  capacidad?: number;
  tipo?: 'AULA' | 'LABORATORIO' | 'SALA_COMPUTO' | 'AUDITORIO' | 'TALLER';
  disponible?: boolean;
}
