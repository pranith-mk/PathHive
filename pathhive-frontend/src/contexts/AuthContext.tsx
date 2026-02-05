import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import api from '@/lib/api'; // Ensure this points to your axios instance

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, fullName: string, username: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void; // <--- ADDED THIS
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
    fullName: data.full_name, // Django sends 'full_name'
    role: data.role,
    avatar: data.avatar,
    bio: data.bio, // Ensure your User type has this if you are using it
    isActive: data.is_active,
    createdAt: new Date(data.created_at || Date.now()),
  });

  // 1. Check Session on App Load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get('/auth/csrf/');
        const { data } = await api.get('/auth/me/');
        setUser(mapUserResponse(data));
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // 2. Login Function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await api.get('/auth/csrf/');
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
      const payload = {
        email,
        password,
        username,
        full_name: fullName,
      };
      
      await api.post('/auth/register/', payload);
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
      setUser(null);
    }
  };

  // 5. Update User Function (Local State Update)
  // This allows components (like Settings) to update the UI immediately
  const updateUser = (userData: Partial<User>) => {
    setUser((prev) => {
        if (!prev) return null;
        return { ...prev, ...userData };
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, isLoading, login, register, logout, updateUser }}>
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