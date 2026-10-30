export interface Torneo {
  id: number;
  nombre: string;
  anio: number;
  activo: boolean;
}

export interface Cancha {
  id: number;
  nombre: string;
  direccion: string;
  activo: boolean;
}

export interface Arbitro {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  activo: boolean;
}

export interface Equipo {
  id: number;
  torneoId: number;
  nombreTorneo?: string;
  nombre: string;
  barrio: string;
  activo: boolean;
}

export interface Jugador {
  id: number;
  equipoId: number;
  nombreEquipo?: string;
  nombre: string;
  apellido: string;
  dni: string;
  numeroCamiseta: number;
  activo: boolean;
}

export type EstadoPartido = 'PROGRAMADO' | 'EN_JUEGO' | 'FINALIZADO' | 'SUSPENDIDO';

// ─── Módulo 4: Reglamento ─────────────────────────────────────────────────────

export interface DisponibilidadResponse {
  disponible: boolean;
  motivo?: string;
}

export type MotivoSancion = 'ROJA' | 'DOS_AMARILLAS';

export interface SancionResponse {
  jugadorId: number;
  nombreJugador: string;
  equipoId: number;
  nombreEquipo: string;
  fechaSuspendido: number;
  motivo: MotivoSancion;
}

export interface SuspensionJugadorResponse {
  suspendido: boolean;
  jugadorId?: number;
  nombreJugador?: string;
  motivo?: string;
}

export interface BloqueoResponse {
  bloqueado: boolean;
  motivo?: string;
}

export interface Partido {
  id: number;
  torneoId: number;
  nombreTorneo?: string;
  numeroFecha: number;
  equipoLocalId: number;
  nombreEquipoLocal?: string;
  equipoVisitanteId: number;
  nombreEquipoVisitante?: string;
  canchaId: number;
  nombreCancha?: string;
  arbitroId: number;
  nombreArbitro?: string;
  fechaHoraInicio: string;
  estado: EstadoPartido;
  golesLocal?: number;
  golesVisitante?: number;
}
