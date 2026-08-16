import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, AuthState, LoginCredentials, LoginResponse, Role } from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setState({ user, token, isAuthenticated: true, isLoading: false });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setState(s => ({ ...s, isLoading: false }));
      }
    } else {
      setState(s => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setState(s => ({ ...s, isLoading: true }));
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Login failed' }));
        throw new Error(error.detail || 'Invalid credentials');
      }

      const data: LoginResponse = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setState({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      setState(s => ({ ...s, isLoading: false }));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  };

  const hasRole = (roles: Role[]) => {
    return state.user !== null && roles.includes(state.user.role);
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}