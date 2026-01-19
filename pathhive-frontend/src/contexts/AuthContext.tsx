import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types';
import { currentUser as mockCurrentUser, mockUsers } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, fullName: string, username: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const isAuthenticated = user !== null;
  const isAdmin = user?.role === 'admin';

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - in real app, this would call an API
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    // For demo, accept any email
    setUser(mockCurrentUser);
    return true;
  };

  const register = async (email: string, password: string, fullName: string, username: string): Promise<boolean> => {
    // Mock register - in real app, this would call an API
    const newUser: User = {
      id: Date.now().toString(),
      email,
      fullName,
      username,
      role: 'user',
      isActive: true,
      createdAt: new Date(),
    };
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, register, logout }}>
      {children}
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
