import { useState, useEffect } from 'react';
import { Ticket, Notification } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, query, where, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export const useTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) {
      loadTickets();
      loadNotifications();
    }
  }, [user]);

  const loadTickets = async () => {
    try {
      // First try to load from Firestore
      const ticketsCollection = collection(db, 'tickets');
      const ticketsSnapshot = await getDocs(ticketsCollection);
      const firestoreTickets = ticketsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Ticket[];
      
      setTickets(firestoreTickets);
      // Update localStorage as fallback
      localStorage.setItem('tickets', JSON.stringify(firestoreTickets));
    } catch (error) {
      console.error('Error loading tickets from Firestore:', error);
      // Fallback to localStorage
      const stored = localStorage.getItem('tickets');
      if (stored) {
        setTickets(JSON.parse(stored));
      }
    }
  };

  const loadNotifications = async () => {
    if (!user) return;
    try {
      // Try to load from Firestore
      const notificationsCollection = collection(db, 'notifications');
      const q = query(notificationsCollection, where('userId', '==', user.id));
      const notificationsSnapshot = await getDocs(q);
      const firestoreNotifications = notificationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];
      
      setNotifications(firestoreNotifications);
      // Update localStorage as fallback
      localStorage.setItem('notifications', JSON.stringify(firestoreNotifications));
    } catch (error) {
      console.error('Error loading notifications from Firestore:', error);
      // Fallback to localStorage
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const allNotifications = JSON.parse(stored);
        setNotifications(allNotifications.filter((n: Notification) => n.userId === user.id));
      }
    }
  };

  const createTicket = async (ticketData: Omit<Ticket, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      // Auto-approve tickets from class reps
      const isClassRep = user.role === 'class_rep';

      const newTicket: Ticket = {
        ...ticketData,
        id: Date.now().toString(),
        userId: user.id,
        status: isClassRep ? 'accepted' : 'submitted',
        acceptedBy: isClassRep ? user.id : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to Firestore
      await setDoc(doc(db, 'tickets', newTicket.id), newTicket);

      const updatedTickets = [...tickets, newTicket];
      setTickets(updatedTickets);
      localStorage.setItem('tickets', JSON.stringify(updatedTickets));

      // Notify class reps only if submitted by student
      if (!isClassRep) {
        await notifyClassReps(`New ticket submitted: ${newTicket.issueType} - ${newTicket.room}`, newTicket.id);
      } else {
        // Notify admins if class rep creates a ticket
        await notifyAdmin(`Class rep submitted ticket: ${newTicket.issueType} - ${newTicket.room}`, newTicket.id);
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      // Fallback to localStorage
      const isClassRep = user.role === 'class_rep';

      const newTicket: Ticket = {
        ...ticketData,
        id: Date.now().toString(),
        userId: user.id,
        status: isClassRep ? 'accepted' : 'submitted',
        acceptedBy: isClassRep ? user.id : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedTickets = [...tickets, newTicket];
      setTickets(updatedTickets);
      localStorage.setItem('tickets', JSON.stringify(updatedTickets));
    }
  };

  const updateTicket = async (ticketId: string, updates: Partial<Ticket>) => {
    try {
      // Update in Firestore
      const ticketRef = doc(db, 'tickets', ticketId);
      await updateDoc(ticketRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      const updatedTickets = tickets.map(t => 
        t.id === ticketId 
          ? { ...t, ...updates, updatedAt: new Date().toISOString() }
          : t
      );
      setTickets(updatedTickets);
      localStorage.setItem('tickets', JSON.stringify(updatedTickets));

      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        // Notify relevant users
        if (updates.status) {
          await createNotification(ticket.userId, ticketId, `Ticket status updated to: ${updates.status}`);
          if (ticket.acceptedBy) {
            await createNotification(ticket.acceptedBy, ticketId, `Ticket status updated to: ${updates.status}`);
          }
        }
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      // Fallback to localStorage
      const updatedTickets = tickets.map(t => 
        t.id === ticketId 
          ? { ...t, ...updates, updatedAt: new Date().toISOString() }
          : t
      );
      setTickets(updatedTickets);
      localStorage.setItem('tickets', JSON.stringify(updatedTickets));
    }
  };

  const deleteTicket = async (ticketId: string) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'tickets', ticketId));

      const updatedTickets = tickets.filter(t => t.id !== ticketId);
      setTickets(updatedTickets);
      localStorage.setItem('tickets', JSON.stringify(updatedTickets));
    } catch (error) {
      console.error('Error deleting ticket:', error);
      // Fallback to localStorage
      const updatedTickets = tickets.filter(t => t.id !== ticketId);
      setTickets(updatedTickets);
      localStorage.setItem('tickets', JSON.stringify(updatedTickets));
    }
  };

  const createNotification = async (userId: string, ticketId: string, message: string, targetPage?: string) => {
    try {
      const newNotification: Notification = {
        id: Date.now().toString() + Math.random(),
        userId,
        ticketId,
        message,
        isRead: false,
        targetPage,
        createdAt: new Date().toISOString(),
      };

      // Save to Firestore
      await setDoc(doc(db, 'notifications', newNotification.id), newNotification);

      const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      allNotifications.push(newNotification);
      localStorage.setItem('notifications', JSON.stringify(allNotifications));

      if (userId === user?.id) {
        setNotifications([...notifications, newNotification]);
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      // Fallback to localStorage
      const newNotification: Notification = {
        id: Date.now().toString() + Math.random(),
        userId,
        ticketId,
        message,
        isRead: false,
        targetPage,
        createdAt: new Date().toISOString(),
      };

      const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      allNotifications.push(newNotification);
      localStorage.setItem('notifications', JSON.stringify(allNotifications));

      if (userId === user?.id) {
        setNotifications([...notifications, newNotification]);
      }
    }
  };

  const notifyClassReps = async (message: string, ticketId: string) => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const classReps = users.filter((u: any) => u.role === 'class_rep' && u.isVerified);
      
      for (const rep of classReps) {
        await createNotification(rep.id, ticketId, message);
      }
    } catch (error) {
      console.error('Error notifying class reps:', error);
    }
  };

  const notifyAdmin = async (message: string, ticketId: string) => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const admins = users.filter((u: any) => u.role === 'admin');
      
      for (const admin of admins) {
        await createNotification(admin.id, ticketId, message);
      }
    } catch (error) {
      console.error('Error notifying admin:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      // Update in Firestore
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, { isRead: true });

      const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updated = allNotifications.map((n: Notification) => 
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      localStorage.setItem('notifications', JSON.stringify(updated));
      
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Fallback to localStorage
      const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updated = allNotifications.map((n: Notification) => 
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      localStorage.setItem('notifications', JSON.stringify(updated));
      
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updated = allNotifications.map((n: Notification) => 
        n.userId === user?.id ? { ...n, isRead: true } : n
      );
      localStorage.setItem('notifications', JSON.stringify(updated));
      
      // Update all in Firestore (batch update would be better but doing individual for now)
      for (const notification of notifications) {
        if (!notification.isRead) {
          const notifRef = doc(db, 'notifications', notification.id);
          await updateDoc(notifRef, { isRead: true });
        }
      }
      
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Fallback to localStorage
      const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updated = allNotifications.map((n: Notification) => 
        n.userId === user?.id ? { ...n, isRead: true } : n
      );
      localStorage.setItem('notifications', JSON.stringify(updated));
      
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    }
  };

  const clearAllNotifications = async () => {
    try {
      // Delete all user's notifications from Firestore
      for (const notification of notifications) {
        await deleteDoc(doc(db, 'notifications', notification.id));
      }

      const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const filtered = allNotifications.filter((n: Notification) => n.userId !== user?.id);
      localStorage.setItem('notifications', JSON.stringify(filtered));
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
      // Fallback to localStorage
      const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const filtered = allNotifications.filter((n: Notification) => n.userId !== user?.id);
      localStorage.setItem('notifications', JSON.stringify(filtered));
      setNotifications([]);
    }
  };

  return {
    tickets,
    notifications,
    createTicket,
    updateTicket,
    deleteTicket,
    createNotification,
    notifyClassReps,
    notifyAdmin,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    loadTickets,
    loadNotifications,
  };
};
