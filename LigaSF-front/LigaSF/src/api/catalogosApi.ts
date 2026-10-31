import { apiClient } from './client';
import { Torneo, Cancha, Arbitro } from './types';

export const getTorneos = (soloActivos: boolean = true): Promise<Torneo[]> => {
  return apiClient<Torneo[]>(`/torneos?soloActivos=${soloActivos}`);
};

export const getTorneoById = (id: number): Promise<Torneo> => {
  return apiClient<Torneo>(`/torneos/${id}`);
};

export const crearTorneo = (data: { nombre: string; anio: number }): Promise<Torneo> => {
  return apiClient<Torneo>('/torneos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getCanchas = (soloActivos: boolean = true): Promise<Cancha[]> => {
  return apiClient<Cancha[]>(`/canchas?soloActivos=${soloActivos}`);
};

export const crearCancha = (data: { nombre: string; direccion: string }): Promise<Cancha> => {
  return apiClient<Cancha>('/canchas', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getArbitros = (soloActivos: boolean = true): Promise<Arbitro[]> => {
  return apiClient<Arbitro[]>(`/arbitros?soloActivos=${soloActivos}`);
};

export const crearArbitro = (data: { nombre: string; apellido: string; dni: string }): Promise<Arbitro> => {
  return apiClient<Arbitro>('/arbitros', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
