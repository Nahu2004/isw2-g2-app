import React, { createContext, useContext, useState, useEffect } from 'react';
import { setAuthToken } from '../api/client';

export interface User {
  id: number;
  username: string;
  nombreCompleto: string;
  rol: 'ADMIN' | 'DELEGADO';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loginUser: (userData: User, userToken: string) => void;
  logoutUser: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loginUser: () => {},
  logoutUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: 1,
    username: 'admin',
    nombreCompleto: 'Administrador de Liga',
    rol: 'ADMIN',
  });
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const loginUser = (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    setAuthToken(userToken);
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
