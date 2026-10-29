import apiClient from './axiosClient';

export const getCatalogos = async () => {
  const response = await apiClient('/catalogos');
  return response.json();
};
