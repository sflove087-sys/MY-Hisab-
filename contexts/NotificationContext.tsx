
import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { Notification, mockNotifications } from '../utils/notifications';
import { safeStorage } from '../utils/storage';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const savedNotifications = safeStorage.getItem('notifications');
      return savedNotifications ? JSON.parse(savedNotifications) : mockNotifications;
    } catch (error) {
      console.error("Failed to load notifications from safeStorage:", error);
      safeStorage.removeItem('notifications');
      return mockNotifications; // Fallback to default
    }
  });

  useEffect(() => {
    try {
      safeStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error("Failed to save notifications to safeStorage:", error);
    }
  }, [notifications]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
    safeStorage.removeItem('notifications');
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
