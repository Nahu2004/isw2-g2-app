import apiClient from './axiosClient';

export const login = async (credentials) => {
  const response = await apiClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  return response.json();
};
