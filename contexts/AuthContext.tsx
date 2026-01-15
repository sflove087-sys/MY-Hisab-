
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
    password: String(u.password).padStart(4, '0'),
    balance: parseFloat(u.balance) || 0,
    commission: parseFloat(u.commission) || 0,
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = safeStorage.getItem('user');
      if (savedUser && savedUser !== 'null' && savedUser !== 'undefined') {
        return normalizeUser(JSON.parse(savedUser));
      }
      return null;
    } catch (error) {
      console.error("Failed to load user from safeStorage:", error);
      safeStorage.removeItem('user');
      return null;
    }
  });

  const login = async (identifier: string, password: string): Promise<User | null> => {
    const loggedInUser = await googleSheetService.loginUser(identifier, password);
    if (loggedInUser && !('error' in loggedInUser)) {
      const normalized = normalizeUser(loggedInUser);
      setUser(normalized);
      safeStorage.setItem('user', JSON.stringify(normalized));
      try {
        // Save user's name and mobile for a quick login next time
        safeStorage.setItem('lastActiveUser', JSON.stringify({ name: normalized.name, mobile: normalized.mobile }));
      } catch (error) {
        console.error("Failed to save last active user:", error);
      }
      return normalized;
    }
    return null;
  };

  const logout = () => {
    setUser(null);
    safeStorage.removeItem('user');
  };
  
  const refreshUser = useCallback(async () => {
    if (user) {
      try {
        const refreshedUser = await googleSheetService.getUserById(user.id);
        if (refreshedUser && !('error' in refreshedUser)) {
          const normalized = normalizeUser(refreshedUser);
          setUser(normalized);
          safeStorage.setItem('user', JSON.stringify(normalized));
        }
      } catch (error) {
        console.error("Failed to refresh user data:", error);
      }
    }
  }, [user]);

  // Sync state to storage whenever it changes
  useEffect(() => {
    if (user) {
      safeStorage.setItem('user', JSON.stringify(user));
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
