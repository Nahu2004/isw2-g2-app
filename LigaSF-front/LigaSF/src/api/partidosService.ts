import axiosClient from './axiosClient';
import { Partido, EstadoPartido } from './types';

export const getPartidos = async (torneoId?: number, numeroFecha?: number): Promise<Partido[]> => {
  const params: Record<string, any> = {};
  if (torneoId !== undefined) params.torneoId = torneoId;
  if (numeroFecha !== undefined) params.numeroFecha = numeroFecha;
  const response = await axiosClient.get<Partido[]>('/partidos', { params });
  return response.data;
};

export const getPartidoById = async (id: number): Promise<Partido> => {
  const response = await axiosClient.get<Partido>(`/partidos/${id}`);
  return response.data;
};

export const cambiarEstadoPartido = async (
  id: number,
  nuevoEstado: EstadoPartido
): Promise<Partido> => {
  const response = await axiosClient.patch<Partido>(`/partidos/${id}/estado`, {
    estado: nuevoEstado,
  });
  return response.data;
};

export const programarPartido = async (data: {
  torneoId: number;
  numeroFecha: number;
  equipoLocalId: number;
  equipoVisitanteId: number;
  canchaId: number;
  arbitroId: number;
  fechaHoraInicio: string;
}): Promise<Partido> => {
  const response = await axiosClient.post<Partido>('/partidos', data);
  return response.data;
};

export const actualizarPartido = async (
  id: number,
  data: {
    torneoId: number;
    numeroFecha: number;
    equipoLocalId: number;
    equipoVisitanteId: number;
    canchaId: number;
    arbitroId: number;
    fechaHoraInicio: string;
  }
): Promise<Partido> => {
  const response = await axiosClient.put<Partido>(`/partidos/${id}`, data);
  return response.data;
};

export const eliminarPartido = async (id: number): Promise<void> => {
  await axiosClient.delete(`/partidos/${id}`);
};

export const partidosService = {
  getPartidos,
  getPartidoById,
  cambiarEstadoPartido,
  programarPartido,
  actualizarPartido,
  eliminarPartido,
};

export default partidosService;
