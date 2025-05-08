
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, authAPI } from '@/services/api';
import { toast } from '@/components/ui/sonner';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuthStatus = async () => {
      const storedToken = localStorage.getItem('bookburstToken');
      if (storedToken) {
        try {
          setToken(storedToken);
          const userData = await authAPI.getProfile();
          setUser(userData);
        } catch (error) {
          console.error('Authentication error:', error);
          localStorage.removeItem('bookburstToken');
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user, token } = await authAPI.login({ email, password });
      localStorage.setItem('bookburstToken', token);
      setUser(user);
      setToken(token);
      toast.success('Successfully logged in!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user, token } = await authAPI.register({ username, email, password });
      localStorage.setItem('bookburstToken', token);
      setUser(user);
      setToken(token);
      toast.success('Successfully registered!');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('bookburstToken');
    setUser(null);
    setToken(null);
    toast.info('You have been logged out');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
