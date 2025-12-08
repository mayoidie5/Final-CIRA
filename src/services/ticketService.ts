import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Ticket, TicketComment } from '../types';

/**
 * Create a new ticket in Firestore
 */
export const createTicket = async (
  ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    console.log('📝 Creating ticket in Firestore:', ticketData);

    // Remove undefined fields - Firestore doesn't allow them
    const cleanedData = Object.fromEntries(
      Object.entries(ticketData).filter(([_, v]) => v !== undefined)
    );

    const docRef = await addDoc(collection(db, 'tickets'), {
      ...cleanedData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      comments: [],
    });

    console.log('✅ Ticket created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating ticket:', error);
    throw error;
  }
};

/**
 * Get all tickets
 */
export const getAllTickets = async (): Promise<Ticket[]> => {
  try {
    console.log('📋 Fetching all tickets from Firestore');

    const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const tickets: Ticket[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || '',
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || '',
        resolvedAt: data.resolvedAt?.toDate?.()?.toISOString() || undefined,
      } as Ticket;
    });

    console.log('✅ Fetched', tickets.length, 'tickets');
    return tickets;
  } catch (error) {
    console.error('❌ Error fetching all tickets:', error);
    throw error;
  }
};

/**
 * Get tickets by user ID (student's own tickets)
 */
export const getUserTickets = async (userId: string): Promise<Ticket[]> => {
  try {
    console.log('📋 Fetching tickets for user:', userId);

    const q = query(
      collection(db, 'tickets'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const tickets: Ticket[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || '',
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || '',
        resolvedAt: data.resolvedAt?.toDate?.()?.toISOString() || undefined,
      } as Ticket;
    });

    console.log('✅ Fetched', tickets.length, 'tickets for user', userId);
    return tickets;
  } catch (error) {
    console.error('❌ Error fetching user tickets:', error);
    throw error;
  }
};

/**
 * Get tickets by status
 */
export const getTicketsByStatus = async (status: string): Promise<Ticket[]> => {
  try {
    console.log('📋 Fetching tickets with status:', status);

    const q = query(
      collection(db, 'tickets'),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const tickets: Ticket[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || '',
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || '',
        resolvedAt: data.resolvedAt?.toDate?.()?.toISOString() || undefined,
      } as Ticket;
    });

    console.log('✅ Fetched', tickets.length, 'tickets with status:', status);
    return tickets;
  } catch (error) {
    console.error('❌ Error fetching tickets by status:', error);
    throw error;
  }
};

/**
 * Get a single ticket by ID
 */
export const getTicketById = async (ticketId: string): Promise<Ticket | null> => {
  try {
    console.log('📋 Fetching ticket:', ticketId);

    const docSnap = await getDoc(doc(db, 'tickets', ticketId));

    if (!docSnap.exists()) {
      console.log('⚠️ Ticket not found:', ticketId);
      return null;
    }

    const data = docSnap.data();
    const ticket: Ticket = {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || '',
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || '',
      resolvedAt: data.resolvedAt?.toDate?.()?.toISOString() || undefined,
    } as Ticket;

    console.log('✅ Fetched ticket:', ticket);
    return ticket;
  } catch (error) {
    console.error('❌ Error fetching ticket:', error);
    throw error;
  }
};

/**
 * Update a ticket
 */
export const updateTicket = async (
  ticketId: string,
  updates: Partial<Ticket>
): Promise<void> => {
  try {
    console.log('📝 Updating ticket:', ticketId);
    console.log('   Incoming updates:', updates);

    const ticketRef = doc(db, 'tickets', ticketId);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    // Remove id from updates to avoid setting it
    delete (updateData as any).id;

    console.log('   Final update data:', updateData);

    await updateDoc(ticketRef, updateData);

    console.log('✅ Ticket updated:', ticketId);
  } catch (error) {
    const err = error as any;
    console.error('❌ Error updating ticket:', error);
    console.error('   Error code:', err?.code);
    console.error('   Error message:', err?.message);
    throw error;
  }
};

/**
 * Delete a ticket
 */
export const deleteTicket = async (ticketId: string): Promise<void> => {
  try {
    console.log('🗑️  Deleting ticket:', ticketId);

    // Delete ticket and all its comments
    const batch = writeBatch(db);

    // Delete main ticket
    batch.delete(doc(db, 'tickets', ticketId));

    // Delete comments sub-collection (if needed)
    const commentsQuery = query(
      collection(db, 'tickets', ticketId, 'comments')
    );
    const commentsSnapshot = await getDocs(commentsQuery);
    commentsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    console.log('✅ Ticket deleted:', ticketId);
  } catch (error) {
    console.error('❌ Error deleting ticket:', error);
    throw error;
  }
};

/**
 * Add a comment to a ticket
 */
export const addCommentToTicket = async (
  ticketId: string,
  comment: Omit<TicketComment, 'id' | 'createdAt'>
): Promise<string> => {
  try {
    console.log('💬 Adding comment to ticket:', ticketId);

    const commentsCollection = collection(db, 'tickets', ticketId, 'comments');
    const docRef = await addDoc(commentsCollection, {
      ...comment,
      createdAt: Timestamp.now(),
    });

    console.log('✅ Comment added with ID:', docRef.id);

    // Update ticket's updatedAt
    await updateTicket(ticketId, {
      updatedAt: new Date().toISOString(),
    } as any);

    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding comment:', error);
    throw error;
  }
};

/**
 * Get comments for a ticket
 */
export const getTicketComments = async (ticketId: string): Promise<TicketComment[]> => {
  try {
    console.log('💬 Fetching comments for ticket:', ticketId);

    const commentsCollection = collection(db, 'tickets', ticketId, 'comments');
    const q = query(commentsCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const comments: TicketComment[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || '',
      } as TicketComment;
    });

    console.log('✅ Fetched', comments.length, 'comments');
    return comments;
  } catch (error) {
    console.error('❌ Error fetching comments:', error);
    throw error;
  }
};

/**
 * Delete a comment
 */
export const deleteComment = async (ticketId: string, commentId: string): Promise<void> => {
  try {
    console.log('🗑️  Deleting comment:', commentId, 'from ticket:', ticketId);

    await deleteDoc(doc(db, 'tickets', ticketId, 'comments', commentId));

    console.log('✅ Comment deleted:', commentId);
  } catch (error) {
    console.error('❌ Error deleting comment:', error);
    throw error;
  }
};

/**
 * Get tickets assigned to admin (accepted by admin)
 */
export const getAdminTickets = async (adminId: string): Promise<Ticket[]> => {
  try {
    console.log('📋 Fetching tickets accepted by admin:', adminId);

    const q = query(
      collection(db, 'tickets'),
      where('acceptedBy', '==', adminId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const tickets: Ticket[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || '',
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || '',
        resolvedAt: data.resolvedAt?.toDate?.()?.toISOString() || undefined,
      } as Ticket;
    });

    console.log('✅ Fetched', tickets.length, 'tickets for admin');
    return tickets;
  } catch (error) {
    console.error('❌ Error fetching admin tickets:', error);
    throw error;
  }
};

/**
 * Get pending tickets (not yet accepted)
 */
export const getPendingTickets = async (): Promise<Ticket[]> => {
  try {
    console.log('📋 Fetching pending tickets');

    const q = query(
      collection(db, 'tickets'),
      where('status', '==', 'submitted'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const tickets: Ticket[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || '',
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || '',
        resolvedAt: data.resolvedAt?.toDate?.()?.toISOString() || undefined,
      } as Ticket;
    });

    console.log('✅ Fetched', tickets.length, 'pending tickets');
    return tickets;
  } catch (error) {
    console.error('❌ Error fetching pending tickets:', error);
    throw error;
  }
};

/**
 * Bulk update tickets status
 */
export const bulkUpdateTicketsStatus = async (
  ticketIds: string[],
  newStatus: string
): Promise<void> => {
  try {
    console.log('📝 Bulk updating', ticketIds.length, 'tickets to status:', newStatus);

    const batch = writeBatch(db);

    ticketIds.forEach(ticketId => {
      const ticketRef = doc(db, 'tickets', ticketId);
      batch.update(ticketRef, {
        status: newStatus,
        updatedAt: Timestamp.now(),
      });
    });

    await batch.commit();

    console.log('✅ Bulk updated', ticketIds.length, 'tickets');
  } catch (error) {
    console.error('❌ Error bulk updating tickets:', error);
    throw error;
  }
};
