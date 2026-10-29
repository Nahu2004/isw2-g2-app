import apiClient from './axiosClient';

export const getEquipos = async () => {
  const response = await apiClient('/equipos');
  return response.json();
};
