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

export type RolUsuarioType = 'ADMIN' | 'DELEGADO' | 'ARBITRO' | 'PLANILLERO' | 'ESPECTADOR';

export type EstadoPartido = 'PROGRAMADO' | 'EN_JUEGO' | 'FINALIZADO' | 'SUSPENDIDO';

export type TipoEvento = 'GOL' | 'AMARILLA' | 'ROJA';

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
  canchaNombre?: string;
  nombreCancha?: string;
  arbitroId: number;
  arbitroNombre?: string;
  nombreArbitro?: string;
  fechaHoraInicio: string;
  estado: EstadoPartido;
  golesLocal?: number;
  golesVisitante?: number;
}

export interface EventoPartido {
  id: number;
  partidoId: number;
  jugadorId: number;
  jugadorNombreCompleto?: string;
  equipoId?: number;
  equipoNombre?: string;
  tipo: TipoEvento;
  minuto: number;
}

export interface LoginResponseData {
  token: string;
  tipo: string;
  username: string;
  nombreCompleto: string;
  rol: 'ADMIN' | 'DELEGADO';
}

export interface ApiErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  mensaje?: string;
}
