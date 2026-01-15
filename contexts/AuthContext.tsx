
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { User } from '../types';
import { googleSheetService } from '../services/googleSheetService';
import { safeStorage } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<User | null>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to normalize user data
const normalizeUser = (u: any): User => {
  return {
    ...u,
    password: String(u.password || '').padStart(4, '0'),
    balance: parseFloat(u.balance) || 0,
    commission: parseFloat(u.commission) || 0,
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = safeStorage.getItem('user');
      if (savedUser && savedUser !== 'null' && savedUser !== 'undefined') {
        const parsed = JSON.parse(savedUser);
        // Robust check to ensure valid user object
        if (parsed && typeof parsed === 'object' && parsed.id && parsed.mobile) {
          return normalizeUser(parsed);
        }
      }
    } catch (error) {
      console.error("Critical: Failed to hydrate user from storage:", error);
      // Don't clear immediately unless it's definitely corrupt
    }
    return null;
  });

  const login = async (identifier: string, password: string): Promise<User | null> => {
    try {
      const loggedInUser = await googleSheetService.loginUser(identifier, password);
      if (loggedInUser && !('error' in loggedInUser)) {
        const normalized = normalizeUser(loggedInUser);
        setUser(normalized);
        
        // Save both full session and "Remember Me" info
        safeStorage.setItem('user', JSON.stringify(normalized));
        safeStorage.setItem('lastActiveUser', JSON.stringify({ 
          name: normalized.name, 
          mobile: normalized.mobile,
          // Persist biometric state if it was already known
          biometricsEnabled: JSON.parse(safeStorage.getItem('lastActiveUser') || '{}').biometricsEnabled || false
        }));
        
        return normalized;
      }
    } catch (error) {
      console.error("Login attempt failed:", error);
    }
    return null;
  };

  const logout = useCallback(() => {
    setUser(null);
    safeStorage.removeItem('user');
    // We KEEP 'lastActiveUser' so the login page can still remember who they are
  }, []);
  
  const refreshUser = useCallback(async () => {
    if (user && user.id) {
      try {
        const refreshedUser = await googleSheetService.getUserById(user.id);
        if (refreshedUser && !('error' in refreshedUser)) {
          const normalized = normalizeUser(refreshedUser);
          setUser(normalized);
          safeStorage.setItem('user', JSON.stringify(normalized));
        }
      } catch (error) {
        console.error("Failed to refresh user data during session:", error);
      }
    }
  }, [user]);

  // Secondary sync effect to ensure storage is always fresh
  useEffect(() => {
    if (user) {
      const userStr = JSON.stringify(user);
      if (safeStorage.getItem('user') !== userStr) {
        safeStorage.setItem('user', userStr);
      }
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
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
