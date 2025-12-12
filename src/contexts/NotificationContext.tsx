import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from '../types';
import {
  addNotification as firebaseAddNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllUserNotifications,
  getUnreadNotificationCount,
} from '../services/notificationService';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  addNotification: (userId: string, ticketId: string, message: string, targetPage?: string) => Promise<void>;
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  deleteNotif: (notificationId: string) => Promise<void>;
  deleteAllNotif: (userId: string) => Promise<void>;
  getUnreadCount: (userId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const addNotification = async (
    userId: string,
    ticketId: string,
    message: string,
    targetPage?: string
  ) => {
    try {
      console.log('🔔 Creating notification for userId:', userId, 'Message:', message);
      const notifId = await firebaseAddNotification(userId, ticketId, message, targetPage);
      console.log('✅ Notification created with ID:', notifId);
      // Don't refetch here - let the client refetch when they actively view notifications
      // This prevents duplicate notifications from being fetched when multiple people are notified
    } catch (error) {
      console.error('❌ Error adding notification:', error);
      throw error;
    }
  };

  const fetchNotifications = async (userId: string) => {
    try {
      setLoading(true);
      console.log('📬 Fetching notifications for user:', userId);
      const notifs = await getUserNotifications(userId);
      console.log('✅ Fetched notifications:', notifs);
      setNotifications(notifs);
      
      // Calculate unread count
      const unread = notifs.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications((prev: Notification[]) =>
        prev.map((n: Notification) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      
      // Update unread count
      setUnreadCount((prev: number) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  };

  const markAllAsRead = async (userId: string) => {
    try {
      await markAllNotificationsAsRead(userId);
      
      // Update local state
      setNotifications((prev: Notification[]) =>
        prev.map((n: Notification) => ({ ...n, isRead: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
      throw error;
    }
  };

  const deleteNotif = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      
      // Update local state
      const deleted = notifications.find((n: Notification) => n.id === notificationId);
      setNotifications((prev: Notification[]) => prev.filter((n: Notification) => n.id !== notificationId));
      
      // Update unread count
      if (deleted && !deleted.isRead) {
        setUnreadCount((prev: number) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      throw error;
    }
  };

  const deleteAllNotif = async (userId: string) => {
    try {
      await deleteAllUserNotifications(userId);
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('❌ Error deleting all notifications:', error);
      throw error;
    }
  };

  const getUnreadCount = async (userId: string) => {
    try {
      const count = await getUnreadNotificationCount(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      throw error;
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        addNotification,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotif,
        deleteAllNotif,
        getUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
