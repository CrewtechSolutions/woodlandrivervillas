import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '../types';
import { authApiService } from '../services/apiService';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  checkEmail: (email: string) => Promise<{ exists: boolean; message?: string }>;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load saved session on initial mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('wv_auth_token');
      const savedUserStr = localStorage.getItem('wv_auth_user');

      if (savedToken && savedUserStr) {
        setToken(savedToken);
        setUser(JSON.parse(savedUserStr));
      }
    } catch (e) {
      console.warn('Failed to restore auth session:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkEmail = async (email: string) => {
    return await authApiService.checkEmail(email);
  };

  const login = async (payload: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await authApiService.login(payload);
      setToken(res.token);
      setUser(res.user);

      localStorage.setItem('wv_auth_token', res.token);
      localStorage.setItem('wv_auth_user', JSON.stringify(res.user));
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: { name: string; email: string; password: string; phone?: string }) => {
    setLoading(true);
    try {
      const res = await authApiService.register(payload);
      setToken(res.token);
      setUser(res.user);

      localStorage.setItem('wv_auth_token', res.token);
      localStorage.setItem('wv_auth_user', JSON.stringify(res.user));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('wv_auth_token');
    localStorage.removeItem('wv_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        loading,
        checkEmail,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
