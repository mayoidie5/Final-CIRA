import { useState, useEffect } from 'react';
import { Ticket } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import * as ticketService from '../services/ticketService';

export const useTickets = () => {
  const { user } = useAuth();
  const { addNotification, fetchNotifications } = useNotifications();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTickets();
    if (user?.id) {
      fetchNotifications(user.id);
    }
  }, [user?.id]);

  const loadTickets = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('📋 Loading tickets for user:', user.id);
      
      const allTickets = await ticketService.getAllTickets();
      setTickets(allTickets);
      
      console.log('✅ Loaded', allTickets.length, 'tickets');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tickets';
      console.error('❌ Error loading tickets:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (
    ticketData: Omit<Ticket, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      console.log('📝 Creating new ticket');

      // Create ticket in Firestore
      const ticketPayload: any = {
        ...ticketData,
        userId: user.id,
        status: 'submitted',
      };

      // Only add acceptedBy if user is class_rep
      if (user.role === 'class_rep') {
        ticketPayload.acceptedBy = user.id;
      }

      const newTicketId = await ticketService.createTicket(ticketPayload);

      // Reload tickets to reflect changes
      await loadTickets();

      // Add notification to the user
      await addNotification(
        user.id,
        newTicketId,
        `✅ Your ticket has been submitted successfully`,
        `/tickets/${newTicketId}`
      );

      console.log('✅ Ticket created with ID:', newTicketId);
      return newTicketId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create ticket';
      console.error('❌ Error creating ticket:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  const updateTicket = async (ticketId: string, updates: Partial<Ticket>) => {
    try {
      setError(null);
      console.log('📝 Updating ticket:', ticketId);

      await ticketService.updateTicket(ticketId, updates);

      // Reload tickets
      await loadTickets();

      // Notify relevant users
      if (updates.status) {
        const ticket = tickets.find(t => t.id === ticketId);
        if (ticket) {
          await addNotification(
            ticket.userId,
            ticketId,
            `🔄 Ticket status updated to: ${updates.status}`,
            `/tickets/${ticketId}`
          );
          if (ticket.acceptedBy) {
            await addNotification(
              ticket.acceptedBy,
              ticketId,
              `🔄 Ticket status updated to: ${updates.status}`,
              `/tickets/${ticketId}`
            );
          }
        }
      }

      console.log('✅ Ticket updated:', ticketId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update ticket';
      console.error('❌ Error updating ticket:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  const deleteTicket = async (ticketId: string): Promise<void> => {
    try {
      setError(null);
      console.log('🗑️  Deleting ticket:', ticketId);

      await ticketService.deleteTicket(ticketId);

      // Reload tickets
      await loadTickets();

      console.log('✅ Ticket deleted:', ticketId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete ticket';
      console.error('❌ Error deleting ticket:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  const notifyClassReps = async (message: string, ticketId: string) => {
    try {
      console.log('📢 Notifying class reps:', message);
      // In a real implementation, query all class reps from Firestore
      // For now, we'll just log
      await addNotification('admin', ticketId, message);
    } catch (err) {
      console.error('❌ Error notifying class reps:', err);
    }
  };

  const notifyAdmin = async (message: string, ticketId: string) => {
    try {
      console.log('📢 Notifying admin:', message);
      // In a real implementation, query all admins from Firestore
      await addNotification('admin', ticketId, message);
    } catch (err) {
      console.error('❌ Error notifying admin:', err);
    }
  };

  const addCommentToTicket = async (
    ticketId: string,
    comment: Omit<any, 'id' | 'createdAt'>
  ): Promise<string> => {
    try {
      setError(null);
      console.log('💬 Adding comment to ticket:', ticketId);

      const commentId = await ticketService.addCommentToTicket(ticketId, comment);

      // Reload tickets
      await loadTickets();

      return commentId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add comment';
      console.error('❌ Error adding comment:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  const getTicketById = async (ticketId: string): Promise<Ticket | null> => {
    try {
      setError(null);
      return await ticketService.getTicketById(ticketId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch ticket';
      console.error('❌ Error fetching ticket:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  const getUserTickets = async (): Promise<Ticket[]> => {
    if (!user?.id) return [];
    
    try {
      setError(null);
      return await ticketService.getUserTickets(user.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user tickets';
      console.error('❌ Error fetching user tickets:', errorMessage);
      setError(errorMessage);
      return [];
    }
  };

  const getTicketsByStatus = async (status: string): Promise<Ticket[]> => {
    try {
      setError(null);
      return await ticketService.getTicketsByStatus(status);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tickets by status';
      console.error('❌ Error fetching tickets by status:', errorMessage);
      setError(errorMessage);
      return [];
    }
  };

  return {
    tickets,
    loading,
    error,
    createTicket,
    updateTicket,
    deleteTicket,
    loadTickets,
    notifyClassReps,
    notifyAdmin,
    addCommentToTicket,
    getTicketById,
    getUserTickets,
    getTicketsByStatus,
  };
};
