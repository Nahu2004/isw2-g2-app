// API calls para el Módulo 4: Reglamento
// Corresponde a los endpoints de ReglamentoController en el backend
// Base path: /api/reglamento

import apiClient from './client';

// ─── Tipos de respuesta ───────────────────────────────────────────────────────

export interface DisponibilidadResponse {
  disponible: boolean;
  motivo?: string;
}

export interface SancionResponse {
  jugadorId: number;
  nombreJugador: string;
  equipoId: number;
  nombreEquipo: string;
  fechaSuspendido: number;
  motivo: 'ROJA' | 'DOS_AMARILLAS';
}

export interface BloqueoResponse {
  bloqueado: boolean;
  motivo?: string;
}

export interface SuspensionJugadorResponse {
  suspendido: boolean;
  jugadorId?: number;
  nombreJugador?: string;
  motivo?: string;
}

// ─── Validación de horarios ───────────────────────────────────────────────────

/**
 * RN-01: Verifica si una cancha está disponible en el horario indicado.
 * @param canchaId  ID de la cancha
 * @param inicio    Fecha y hora en formato ISO 8601, ej: "2025-05-10T16:00:00"
 */
export const consultarDisponibilidadCancha = (
  canchaId: number,
  inicio: string
): Promise<DisponibilidadResponse> => {
  const params = new URLSearchParams({ inicio });
  return apiClient<DisponibilidadResponse>(
    `/reglamento/disponibilidad/cancha/${canchaId}?${params}`
  );
};

/**
 * RN-02: Verifica si un árbitro está disponible en el horario indicado.
 * @param arbitroId ID del árbitro
 * @param inicio    Fecha y hora en formato ISO 8601, ej: "2025-05-10T16:00:00"
 */
export const consultarDisponibilidadArbitro = (
  arbitroId: number,
  inicio: string
): Promise<DisponibilidadResponse> => {
  const params = new URLSearchParams({ inicio });
  return apiClient<DisponibilidadResponse>(
    `/reglamento/disponibilidad/arbitro/${arbitroId}?${params}`
  );
};

// ─── Sanciones ────────────────────────────────────────────────────────────────

/**
 * RN-03: Lista todos los jugadores sancionados para la próxima fecha de un torneo.
 * @param torneoId ID del torneo
 * @param fecha    Número de la PRÓXIMA fecha (la que va a ser jugada)
 */
export const listarSancionados = (
  torneoId: number,
  fecha: number
): Promise<SancionResponse[]> => {
  const params = new URLSearchParams({
    torneoId: String(torneoId),
    fecha: String(fecha),
  });
  return apiClient<SancionResponse[]>(`/reglamento/sanciones?${params}`);
};

/**
 * Consulta la suspensión puntual de un jugador en una fecha.
 * @param jugadorId ID del jugador
 * @param torneoId  ID del torneo
 * @param fecha     Número de la fecha a consultar
 */
export const consultarSuspensionJugador = (
  jugadorId: number,
  torneoId: number,
  fecha: number
): Promise<SuspensionJugadorResponse> => {
  const params = new URLSearchParams({
    torneoId: String(torneoId),
    fecha: String(fecha),
  });
  return apiClient<SuspensionJugadorResponse>(
    `/reglamento/sanciones/jugador/${jugadorId}?${params}`
  );
};

// ─── Bloqueo de jugadores ─────────────────────────────────────────────────────

/**
 * Verifica si un jugador está bloqueado para jugar en una fecha específica.
 * Un jugador bloqueado no puede alinearse aunque el equipo lo intente.
 * @param jugadorId ID del jugador
 * @param torneoId  ID del torneo
 * @param fecha     Número de la fecha
 */
export const consultarBloqueoJugador = (
  jugadorId: number,
  torneoId: number,
  fecha: number
): Promise<BloqueoResponse> => {
  const params = new URLSearchParams({
    torneoId: String(torneoId),
    fecha: String(fecha),
  });
  return apiClient<BloqueoResponse>(
    `/reglamento/bloqueo/jugador/${jugadorId}?${params}`
  );
};
