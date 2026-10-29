// Configuración de Axios / Fetch y clientes HTTP
// Interceptor para inyectar token JWT y manejar 401

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.225:8080/api';

// Cliente HTTP base (puede complementarse con axios una vez instalado)
export const apiClient = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Manejo de expiración de sesión
    console.warn('Sesión no autorizada (401)');
  }

  return response;
};

export default apiClient;
