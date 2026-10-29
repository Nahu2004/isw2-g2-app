import apiClient from './axiosClient';

export const getEventosByPartido = async (partidoId) => {
  const response = await apiClient(`/partidos/${partidoId}/eventos`);
  return response.json();
};
