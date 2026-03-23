export interface Profesor {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  activo: boolean;
  createdAt: string;
}

export interface Materia {
  id: number;
  nombre: string;
  clave: string;
  horasSemanales: number;
  creditos: number;
  carrera: string;
  semestre: number;
  activa: boolean;
}

export interface Salon {
  id: number;
  nombre: string;
  edificio?: string;
  capacidad: number;
  tipo: 'AULA' | 'LABORATORIO' | 'SALA_COMPUTO' | 'AUDITORIO' | 'TALLER';
  disponible: boolean;
}

export interface BloqueHorario {
  id: number;
  diaSemana: 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO';
  horaInicio: string;
  horaFin: string;
  duracionMin: number;
}

export interface PeriodoEscolar {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
}

export interface Grupo {
  id: number;
  nombre: string;
  semestre: number;
  carrera: string;
  cupo: number;
  periodoId: number;
  periodo?: PeriodoEscolar;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'COORDINADOR' | 'PROFESOR';
  activo: boolean;
  profesorId?: number;
}