export class UpdateUsuarioDto {
  nombre?: string;
  email?: string;
  rol?: 'ADMIN' | 'COORDINADOR' | 'PROFESOR';
  activo?: boolean;
  profesorId?: number;
}
