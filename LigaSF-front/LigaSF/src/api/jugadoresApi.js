import apiClient from './axiosClient';

export const getJugadores = async () => {
  const response = await apiClient('/jugadores');
  return response.json();
};
