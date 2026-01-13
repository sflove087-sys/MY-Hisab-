
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
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (identifier: string, password: string): Promise<User | null> => {
    const loggedInUser = await googleSheetService.loginUser(identifier, password);
    if (loggedInUser) {
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      localStorage.setItem('lastActiveUser', JSON.stringify({ name: loggedInUser.name, mobile: loggedInUser.mobile }));
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
      const refreshedUser = await googleSheetService.getUserById(user.id);
      if (refreshedUser) {
        setUser(refreshedUser);
        localStorage.setItem('user', JSON.stringify(refreshedUser));
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