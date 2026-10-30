import axiosClient from './axiosClient';
import { EventoPartido, TipoEvento } from './types';

export interface RegistrarEventoDTO {
  jugadorId: number;
  tipo: TipoEvento;
  minuto: number;
}

export const getEventosByPartido = async (partidoId: number): Promise<EventoPartido[]> => {
  const response = await axiosClient.get<EventoPartido[]>(`/partidos/${partidoId}/eventos`);
  return response.data;
};

export const registrarEvento = async (
  partidoId: number,
  data: RegistrarEventoDTO
): Promise<EventoPartido> => {
  const response = await axiosClient.post<EventoPartido>(`/partidos/${partidoId}/eventos`, data);
  return response.data;
};

export const eliminarEvento = async (eventoId: number): Promise<void> => {
  await axiosClient.delete(`/eventos/${eventoId}`);
};

export const eventosService = {
  getEventosByPartido,
  registrarEvento,
  eliminarEvento,
};

export default eventosService;
