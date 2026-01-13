
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { User } from '../types';
import { googleSheetService } from '../services/googleSheetService';

interface AuthContextType {
  user: User | null;
  login: (mobile: string, password: string) => Promise<User | null>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (mobile: string, password: string): Promise<User | null> => {
    const loggedInUser = await googleSheetService.loginUser(mobile, password);
    if (loggedInUser) {
      setUser(loggedInUser);
      // Remember the user for the next app launch's quick login screen
      localStorage.setItem('lastActiveUser', JSON.stringify({ name: loggedInUser.name, mobile: loggedInUser.mobile }));
    }
    return loggedInUser;
  };

  const logout = () => {
    setUser(null);
    // When logging out, we don't want the quick login screen next time.
    // Or we can keep it. For now, let's remove it for a full logout.
    localStorage.removeItem('lastActiveUser');
  };
  
  const refreshUser = useCallback(async () => {
    if (user) {
      const refreshedUser = await googleSheetService.getUserById(user.id);
      if (refreshedUser) {
        setUser(refreshedUser);
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
