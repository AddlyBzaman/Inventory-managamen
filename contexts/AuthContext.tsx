'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  refreshToken: () => Promise<boolean>;
  extendSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session timeout configuration
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIMEOUT = 25 * 60 * 1000; // 25 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);
  const [warningTimer, setWarningTimer] = useState<NodeJS.Timeout | null>(null);

  // Clear session timers
  const clearTimers = () => {
    if (sessionTimer) clearTimeout(sessionTimer);
    if (warningTimer) clearTimeout(warningTimer);
    setSessionTimer(null);
    setWarningTimer(null);
  };

  // Set session timers
  const setSessionTimers = () => {
    clearTimers();
    
    // Warning timer (5 minutes before timeout)
    const warning = setTimeout(() => {
      console.warn('Session will expire in 5 minutes');
      // You could show a toast notification here
    }, WARNING_TIMEOUT);
    
    // Session timeout
    const timeout = setTimeout(async () => {
      await logout();
    }, SESSION_TIMEOUT);
    
    setWarningTimer(warning);
    setSessionTimer(timeout);
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 Checking authentication...');
        const currentUser = await authService.getCurrentUser();
        console.log('👤 Current user result:', currentUser);
        
        if (currentUser) {
          setIsAuthenticated(true);
          setUser(currentUser);
          setSessionTimers();
          console.log('✅ User authenticated successfully');
        } else {
          console.log('❌ No user found, staying unauthenticated');
        }
      } catch (error) {
        console.error('❌ Auth check error:', error);
        // Don't auto logout on error, just stay unauthenticated
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Cleanup on unmount
    return () => clearTimers();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const userData = await authService.login(username, password);
      
      if (userData) {
        setIsAuthenticated(true);
        setUser(userData);
        setSessionTimers();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      clearTimers();
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      console.log('🔄 Refreshing token...');
      const currentUser = await authService.getCurrentUser();
      console.log('👤 Refresh token result:', currentUser);
      
      if (currentUser) {
        setUser(currentUser);
        setSessionTimers();
        console.log('✅ Token refreshed successfully');
        return true;
      }
      console.log('❌ Token refresh failed - no user');
      return false;
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      // Don't auto logout on refresh error
      return false;
    }
  };

  // Extend session on user activity
  const extendSession = () => {
    if (isAuthenticated) {
      setSessionTimers();
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        user, 
        login, 
        logout, 
        isLoading, 
        refreshToken,
        extendSession
      }}
    >
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
