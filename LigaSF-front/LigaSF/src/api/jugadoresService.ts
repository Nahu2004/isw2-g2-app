import axiosClient from './axiosClient';
import { Jugador } from './types';

export const getJugadores = async (
  equipoId?: number,
  soloActivos: boolean = true
): Promise<Jugador[]> => {
  const params: Record<string, any> = { soloActivos };
  if (equipoId !== undefined) {
    params.equipoId = equipoId;
  }
  const response = await axiosClient.get<Jugador[]>('/jugadores', { params });
  return response.data;
};

export const getJugadorById = async (id: number): Promise<Jugador> => {
  const response = await axiosClient.get<Jugador>(`/jugadores/${id}`);
  return response.data;
};

export const jugadoresService = {
  getJugadores,
  getJugadorById,
};

export default jugadoresService;
