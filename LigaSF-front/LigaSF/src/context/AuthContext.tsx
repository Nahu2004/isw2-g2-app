import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setAuthToken, registerUnauthorizedHandler } from '../api/axiosClient';
import { setAuthToken as setClientToken } from '../api/client';
import { useRouter } from 'expo-router';

export interface User {
  username: string;
  nombreCompleto: string;
  rol: 'ADMIN' | 'DELEGADO';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loginUser: (userData: User, userToken: string) => void;
  logoutUser: () => void;
}

const STORAGE_KEY_TOKEN = 'LIGASF_AUTH_TOKEN';
const STORAGE_KEY_USER = 'LIGASF_AUTH_USER';
const STORAGE_KEY_TIMESTAMP = 'LIGASF_AUTH_TIMESTAMP';
const TOKEN_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 horas de validez (RNF-05)

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  loginUser: () => {},
  logoutUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  // Inicializar estado leyendo de localStorage (web) si está disponible
  const [token, setToken] = useState<string | null>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
        const savedTime = localStorage.getItem(STORAGE_KEY_TIMESTAMP);
        if (savedToken && savedTime) {
          const age = Date.now() - parseInt(savedTime, 10);
          if (age < TOKEN_MAX_AGE_MS) {
            return savedToken;
          } else {
            localStorage.removeItem(STORAGE_KEY_TOKEN);
            localStorage.removeItem(STORAGE_KEY_USER);
            localStorage.removeItem(STORAGE_KEY_TIMESTAMP);
          }
        }
      }
    } catch {
      // Ignorar errores de acceso a almacenamiento
    }
    return null;
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedUser = localStorage.getItem(STORAGE_KEY_USER);
        const savedTime = localStorage.getItem(STORAGE_KEY_TIMESTAMP);
        if (savedUser && savedTime) {
          const age = Date.now() - parseInt(savedTime, 10);
          if (age < TOKEN_MAX_AGE_MS) {
            return JSON.parse(savedUser);
          }
        }
      }
    } catch {
      // Ignorar
    }
    // Usuario delegado de demostración inicial si no hay sesión
    return {
      username: 'admin',
      nombreCompleto: 'Carlos Delegado',
      rol: 'ADMIN',
    };
  });

  const logoutUser = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    setClientToken(null);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(STORAGE_KEY_TOKEN);
        localStorage.removeItem(STORAGE_KEY_USER);
        localStorage.removeItem(STORAGE_KEY_TIMESTAMP);
      }
    } catch {
      // Ignorar
    }
    try {
      router.replace('/auth/login' as any);
    } catch {
      // Ignorar si router aún no está montado
    }
  }, [router]);

  const loginUser = useCallback((userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    setAuthToken(userToken);
    setClientToken(userToken);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY_TOKEN, userToken);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));
        localStorage.setItem(STORAGE_KEY_TIMESTAMP, Date.now().toString());
      }
    } catch {
      // Ignorar
    }
  }, []);

  // Registrar callback global para respuestas 401 Unauthorized
  useEffect(() => {
    registerUnauthorizedHandler(() => {
      logoutUser();
    });
  }, [logoutUser]);

  // Mantener sincrónico el token en los clientes HTTP
  useEffect(() => {
    setAuthToken(token);
    setClientToken(token);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token || !!user,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
