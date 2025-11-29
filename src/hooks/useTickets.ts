import { useState, useEffect } from 'react';
import { Ticket, Notification } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadTickets();
    loadNotifications();
  }, [user]);

  const loadTickets = () => {
    const stored = localStorage.getItem('tickets');
    if (stored) {
      setTickets(JSON.parse(stored));
    }
  };

  const loadNotifications = () => {
    if (!user) return;
    const stored = localStorage.getItem('notifications');
    if (stored) {
      const allNotifications = JSON.parse(stored);
      setNotifications(allNotifications.filter((n: Notification) => n.userId === user.id));
    }
  };

  const createTicket = (ticketData: Omit<Ticket, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    // Auto-approve tickets from class reps
    const isClassRep = user.role === 'class_rep';

    const newTicket: Ticket = {
      ...ticketData,
      id: Date.now().toString(),
      userId: user.id,
      status: 'submitted',
      acceptedBy: isClassRep ? user.id : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedTickets = [...tickets, newTicket];
    setTickets(updatedTickets);
    localStorage.setItem('tickets', JSON.stringify(updatedTickets));

    // Notify class reps only if submitted by student
    if (!isClassRep) {
      notifyClassReps(`New ticket submitted: ${newTicket.issueType} - ${newTicket.room}`, newTicket.id);
    } else {
      // Notify admins if class rep creates a ticket
      notifyAdmin(`Class rep submitted ticket: ${newTicket.issueType} - ${newTicket.room}`, newTicket.id);
    }
  };

  const updateTicket = (ticketId: string, updates: Partial<Ticket>) => {
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
        createNotification(ticket.userId, ticketId, `Ticket status updated to: ${updates.status}`);
        if (ticket.acceptedBy) {
          createNotification(ticket.acceptedBy, ticketId, `Ticket status updated to: ${updates.status}`);
        }
      }
    }
  };

  const deleteTicket = (ticketId: string) => {
    const updatedTickets = tickets.filter(t => t.id !== ticketId);
    setTickets(updatedTickets);
    localStorage.setItem('tickets', JSON.stringify(updatedTickets));
  };

  const createNotification = (userId: string, ticketId: string, message: string, targetPage?: string) => {
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
  };

  const notifyClassReps = (message: string, ticketId: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const classReps = users.filter((u: any) => u.role === 'class_rep' && u.isVerified);
    
    classReps.forEach((rep: any) => {
      createNotification(rep.id, ticketId, message);
    });
  };

  const notifyAdmin = (message: string, ticketId: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const admins = users.filter((u: any) => u.role === 'admin');
    
    admins.forEach((admin: any) => {
      createNotification(admin.id, ticketId, message);
    });
  };

  const markNotificationAsRead = (notificationId: string) => {
    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updated = allNotifications.map((n: Notification) => 
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    localStorage.setItem('notifications', JSON.stringify(updated));
    
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  };

  const markAllNotificationsAsRead = () => {
    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updated = allNotifications.map((n: Notification) => 
      n.userId === user?.id ? { ...n, isRead: true } : n
    );
    localStorage.setItem('notifications', JSON.stringify(updated));
    
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const clearAllNotifications = () => {
    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const filtered = allNotifications.filter((n: Notification) => n.userId !== user?.id);
    localStorage.setItem('notifications', JSON.stringify(filtered));
    setNotifications([]);
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
