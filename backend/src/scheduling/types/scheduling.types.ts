export interface AsignacionPendiente {
  grupoId: number;
  materiaId: number;
  profesoresHabilitados: number[];
  horasRestantes: number;
}

export interface EstadoScheduling {
  asignaciones: AsignacionRealizada[];
  profesorOcupado: Map<string, boolean>;
  salonOcupado: Map<string, boolean>;
  grupoOcupado: Map<string, boolean>;
}

export interface AsignacionRealizada {
  profesorId: number;
  materiaId: number;
  grupoId: number;
  salonId: number;
  bloqueId: number;
  periodoId: number;
}

export interface ResultadoScheduling {
  exito: boolean;
  asignaciones: AsignacionRealizada[];
  mensaje: string;
  totalAsignaciones: number;
}
