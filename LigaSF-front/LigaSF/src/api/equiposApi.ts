import { apiClient } from './client';
import { Equipo } from './types';

export const getEquipos = (torneoId?: number, soloActivos: boolean = true): Promise<Equipo[]> => {
  const query = new URLSearchParams();
  if (torneoId !== undefined) query.append('torneoId', torneoId.toString());
  query.append('soloActivos', soloActivos.toString());
  return apiClient<Equipo[]>(`/equipos?${query.toString()}`);
};

export const getEquipoById = (id: number): Promise<Equipo> => {
  return apiClient<Equipo>(`/equipos/${id}`);
};

export const crearEquipo = (data: { torneoId: number; nombre: string; barrio: string }): Promise<Equipo> => {
  return apiClient<Equipo>('/equipos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const actualizarEquipo = (
  id: number,
  data: { torneoId: number; nombre: string; barrio: string }
): Promise<Equipo> => {
  return apiClient<Equipo>(`/equipos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const desactivarEquipo = (id: number): Promise<Equipo> => {
  return apiClient<Equipo>(`/equipos/${id}`, {
    method: 'DELETE',
  });
};

export const reactivarEquipo = (id: number): Promise<Equipo> => {
  return apiClient<Equipo>(`/equipos/${id}/reactivar`, {
    method: 'PATCH',
  });
};
