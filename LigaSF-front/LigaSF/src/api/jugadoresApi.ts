import { apiClient } from './client';
import { Jugador } from './types';

export const getJugadores = (equipoId?: number, soloActivos: boolean = true): Promise<Jugador[]> => {
  const query = new URLSearchParams();
  if (equipoId !== undefined) query.append('equipoId', equipoId.toString());
  query.append('soloActivos', soloActivos.toString());
  return apiClient<Jugador[]>(`/jugadores?${query.toString()}`);
};

export const getJugadorById = (id: number): Promise<Jugador> => {
  return apiClient<Jugador>(`/jugadores/${id}`);
};

export const crearJugador = (data: {
  equipoId: number;
  nombre: string;
  apellido: string;
  dni: string;
  numeroCamiseta: number;
}): Promise<Jugador> => {
  return apiClient<Jugador>('/jugadores', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const actualizarJugador = (
  id: number,
  data: {
    equipoId: number;
    nombre: string;
    apellido: string;
    dni: string;
    numeroCamiseta: number;
  }
): Promise<Jugador> => {
  return apiClient<Jugador>(`/jugadores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const desactivarJugador = (id: number): Promise<Jugador> => {
  return apiClient<Jugador>(`/jugadores/${id}`, {
    method: 'DELETE',
  });
};

export const reactivarJugador = (id: number): Promise<Jugador> => {
  return apiClient<Jugador>(`/jugadores/${id}/reactivar`, {
    method: 'PATCH',
  });
};
