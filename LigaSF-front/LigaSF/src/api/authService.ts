import axiosClient from './axiosClient';
import { LoginResponseData } from './types';

export interface LoginCredentials {
  username: string;
  password: string;
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponseData> => {
  const response = await axiosClient.post<LoginResponseData>('/auth/login', credentials);
  return response.data;
};

export const authService = {
  login,
};

export default authService;
