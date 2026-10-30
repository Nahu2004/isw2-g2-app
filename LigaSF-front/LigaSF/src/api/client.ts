// Cliente HTTP base configurado con fetch
// Maneja Base URL, inyección de token JWT, y parseo de respuestas/errores

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.225:8080/api';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const apiClient = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null as T;
  }

  let data: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg =
      (data && typeof data === 'object' && (data.mensaje || data.message || data.error)) ||
      `Error HTTP ${response.status}: ${response.statusText}`;
    throw new ApiError(response.status, errorMsg, data);
  }

  return data as T;
};

export default apiClient;
