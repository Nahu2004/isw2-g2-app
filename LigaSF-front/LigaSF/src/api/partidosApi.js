import apiClient from './axiosClient';

export const getPartidos = async () => {
  const response = await apiClient('/partidos');
  return response.json();
};
