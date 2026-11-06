import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Obtiene la URL base de la API automáticamente:
 * 1. Si existe variable de entorno EXPO_PUBLIC_API_URL, la respeta.
 * 2. Si se corre en Web (navegador), apunta a http://localhost:8080/api.
 * 3. Si se corre en Celular con Expo Go, detecta la IP de la máquina que corre Metro
 *    (ej: Constants.expoConfig.hostUri = "192.168.0.x:8081" -> "http://192.168.0.x:8080/api").
 * 4. Fallback final: http://localhost:8080/api.
 */
export const getApiBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:8080/api';
  }

  // Detección automática en dispositivos móviles mediante Expo
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip) {
      return `http://${ip}:8080/api`;
    }
  }

  return 'http://localhost:8080/api';
};
