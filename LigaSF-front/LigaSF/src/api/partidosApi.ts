import { apiClient } from './client';
import { Partido } from './types';

export const getPartidos = (torneoId?: number, numeroFecha?: number): Promise<Partido[]> => {
  const query = new URLSearchParams();
  if (torneoId !== undefined) query.append('torneoId', torneoId.toString());
  if (numeroFecha !== undefined) query.append('numeroFecha', numeroFecha.toString());
  return apiClient<Partido[]>(`/partidos?${query.toString()}`);
};

export const getPartidoById = (id: number): Promise<Partido> => {
  return apiClient<Partido>(`/partidos/${id}`);
};

export const programarPartido = (data: {
  torneoId: number;
  numeroFecha: number;
  equipoLocalId: number;
  equipoVisitanteId: number;
  canchaId: number;
  arbitroId: number;
  fechaHoraInicio: string;
}): Promise<Partido> => {
  return apiClient<Partido>('/partidos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const actualizarPartido = (
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
  return apiClient<Partido>(`/partidos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const eliminarPartido = (id: number): Promise<void> => {
  return apiClient<void>(`/partidos/${id}`, {
    method: 'DELETE',
  });
};
