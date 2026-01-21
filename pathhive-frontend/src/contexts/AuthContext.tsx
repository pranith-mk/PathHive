import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import api from '../lib/api'; // Ensure this path matches where you saved the axios helper

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean; // Added this to prevent flickering while checking session
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, fullName: string, username: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;
  const isAdmin = user?.role === 'admin';

  // Helper to map Django response (snake_case) to Frontend type (camelCase)
  const mapUserResponse = (data: any): User => ({
    id: data.id,
    email: data.email,
    username: data.username,
    fullName: data.full_name, // Django sends 'full_name', frontend expects 'fullName'
    role: data.role,
    avatar: data.avatar,
    isActive: data.is_active,
    createdAt: new Date(data.created_at || Date.now()), // Handle date string parsing if needed
  });

  // 1. Check Session on App Load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get('/auth/csrf/'); // Ensure CSRF cookie is set
        const { data } = await api.get('/auth/me/');
        setUser(mapUserResponse(data));
      } catch (error) {
        setUser(null); // Not logged in
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // 2. Login Function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await api.get('/auth/csrf/'); // Refresh CSRF token before post
      const response = await api.post('/auth/login/', { email, password });
      setUser(mapUserResponse(response.data));
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  // 3. Register Function
  const register = async (email: string, password: string, fullName: string, username: string): Promise<boolean> => {
    try {
      await api.get('/auth/csrf/');
      // Send data matching Django's serializer fields
      const payload = {
        email,
        password,
        username,
        full_name: fullName, // Map back to snake_case for Django
      };
      
      await api.post('/auth/register/', payload);
      
      // Auto-login after successful registration
      return await login(email, password);
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  // 4. Logout Function
  const logout = async () => {
    try {
      await api.post('/auth/logout/');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if API fails, clear local state
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, isLoading, login, register, logout }}>
      {/* Do not render children until we check if the user is logged in */}
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}