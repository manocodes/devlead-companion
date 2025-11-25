import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getUserProfile } from '../client-api/client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      let token = urlToken || localStorage.getItem('token');

      if (token) {
        if (urlToken) {
          localStorage.setItem('token', token);
          window.history.replaceState({}, document.title, '/');
        }

        try {
          const userData = await getUserProfile(token);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to fetch profile during init:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    // We could fetch profile here immediately or let the effect/query handle it
    // For now, let's just set authenticated. Ideally, we'd refetch user data.
    // Since we are moving to React Query, we might want to invalidate queries here.
    // But for this step, we'll keep it simple and maybe fetch profile if needed.
    getUserProfile(token)
      .then(setUser)
      .catch(() => logout());
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
