import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface UserContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  loginWithGoogle: (credentialToken: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: any) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('user_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const profile = await api.getUserProfile(token);
          setUser(profile);
        } catch (err) {
          console.error("Session restoration failed:", err);
          // Token expired or invalid
          localStorage.removeItem('user_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [token]);

  const login = useCallback(async (credentials: any) => {
    setIsLoading(true);
    try {
      const data = await api.userLogin(credentials);
      localStorage.setItem('user_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (err) {
      localStorage.removeItem('user_token');
      setToken(null);
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: any) => {
    setIsLoading(true);
    try {
      const data = await api.userRegister(userData);
      localStorage.setItem('user_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (err) {
      localStorage.removeItem('user_token');
      setToken(null);
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user_token');
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (profileData: any) => {
    if (!token) throw new Error("No token found");
    setIsLoading(true);
    try {
      const data = await api.updateUserProfile(token, profileData);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const loginWithGoogle = useCallback(async (credentialToken: string) => {
    setIsLoading(true);
    try {
      const data = await api.googleLogin(credentialToken);
      localStorage.setItem('user_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (err) {
      localStorage.removeItem('user_token');
      setToken(null);
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isAuthenticated = !!user;

  return (
    <UserContext.Provider value={{ user, token, isAuthenticated, isLoading, login, register, loginWithGoogle, logout, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
