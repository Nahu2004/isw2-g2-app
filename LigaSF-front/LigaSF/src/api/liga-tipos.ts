export type EstadoPartido = 'PROGRAMADO' | 'EN_JUEGO' | 'FINALIZADO' | 'SUSPENDIDO';
export type TipoEvento = 'GOL' | 'AMARILLA' | 'ROJA';
export type MotivoSancion = 'ROJA' | 'DOBLE_AMARILLA';

export interface Posicion {
  equipoId: number;
  equipoNombre: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
}

export interface Partido {
  id: number;
  torneoId: number;
  torneoNombre: string;
  numeroFecha: number;
  equipoLocalId: number;
  equipoLocalNombre: string;
  equipoVisitanteId: number;
  equipoVisitanteNombre: string;
  canchaId: number;
  canchaNombre: string;
  arbitroId: number;
  arbitroNombre: string;
  fechaHoraInicio: string;
  estado: EstadoPartido;
  golesLocal: number;
  golesVisitante: number;
}

export interface EventoPartido {
  id: number;
  partidoId: number;
  jugadorId: number;
  jugadorNombreCompleto: string;
  equipoId: number;
  equipoNombre: string;
  tipo: TipoEvento;
  minuto: number;
}

export interface Suspendido {
  jugadorId: number;
  jugadorNombre: string;
  equipoId: number;
  equipoNombre: string;
  motivo: MotivoSancion;
  fechaSancion: number;
}
