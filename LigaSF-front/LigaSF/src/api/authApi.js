import { setAuthToken } from './axiosClient';
import client from './client';

export const login = async (credentials) => {
  const response = await client('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  if (response?.token) {
    setAuthToken(response.token);
  }
  return response;
};
