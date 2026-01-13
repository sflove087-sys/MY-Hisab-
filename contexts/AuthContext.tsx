
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { User } from '../types';
import { googleSheetService } from '../services/googleSheetService';

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<User | null>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Failed to load user from localStorage:", error);
      localStorage.removeItem('user');
      return null;
    }
  });

  const login = async (identifier: string, password: string): Promise<User | null> => {
    const loggedInUser = await googleSheetService.loginUser(identifier, password);
    if (loggedInUser) {
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      try {
        localStorage.setItem('lastActiveUser', JSON.stringify({ name: loggedInUser.name, mobile: loggedInUser.mobile }));
      } catch (error) {
        console.error("Failed to save last active user:", error);
      }
    }
    return loggedInUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('lastActiveUser');
  };
  
  const refreshUser = useCallback(async () => {
    if (user) {
      try {
        const refreshedUser = await googleSheetService.getUserById(user.id);
        if (refreshedUser) {
          setUser(refreshedUser);
          localStorage.setItem('user', JSON.stringify(refreshedUser));
        }
      } catch (error) {
        console.error("Failed to refresh user data:", error);
        // Optional: handle user refresh failure, e.g., by logging them out
        // logout();
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
