import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from '../types';

const USERS_COLLECTION = 'users';

/**
 * Fetch all users from Firestore (excluding admins and pending)
 */
export const fetchAllUsers = async (): Promise<User[]> => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('role', '!=', 'admin'),
      where('isPending', '==', false)
    );
    const querySnapshot = await getDocs(q);
    const users: User[] = [];

    querySnapshot.forEach(docSnapshot => {
      const data = docSnapshot.data();
      users.push({
        id: docSnapshot.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        studentId: data.studentId,
        course: data.course,
        section: data.section,
        yearLevel: data.yearLevel,
        department: data.department,
        isVerified: data.isVerified || false,
        isPending: data.isPending || false,
        pendingDeletion: data.pendingDeletion || false,
        deletionDate: data.deletionDate?.toDate?.()?.toISOString() || data.deletionDate,
        deletionReason: data.deletionReason,
        theme: data.theme || 'system',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      });
    });

    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users from database');
  }
};

/**
 * Fetch all pending users (class representative requests)
 */
export const fetchPendingUsers = async (): Promise<User[]> => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('role', '!=', 'admin'),
      where('isPending', '==', true)
    );
    const querySnapshot = await getDocs(q);
    const users: User[] = [];

    querySnapshot.forEach(docSnapshot => {
      const data = docSnapshot.data();
      users.push({
        id: docSnapshot.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        studentId: data.studentId,
        course: data.course,
        section: data.section,
        yearLevel: data.yearLevel,
        department: data.department,
        isVerified: data.isVerified || false,
        isPending: data.isPending || true,
        pendingDeletion: data.pendingDeletion || false,
        deletionDate: data.deletionDate?.toDate?.()?.toISOString() || data.deletionDate,
        deletionReason: data.deletionReason,
        theme: data.theme || 'system',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      });
    });

    return users;
  } catch (error) {
    console.error('Error fetching pending users:', error);
    throw new Error('Failed to fetch pending users from database');
  }
};

/**
 * Approve a pending user (class representative request)
 */
export const approveUser = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      isPending: false,
      isVerified: true,
    });
  } catch (error) {
    console.error('Error approving user:', error);
    throw new Error('Failed to approve user');
  }
};

/**
 * Reject a pending user (class representative request)
 */
export const rejectUser = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error rejecting user:', error);
    throw new Error('Failed to reject user');
  }
};

/**
 * Delete a user immediately
 */
export const deleteUserInstant = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user');
  }
};

/**
 * Schedule user deletion (3-day warning)
 */
export const scheduleUserDeletion = async (
  userId: string,
  reason: string
): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 3);

    await updateDoc(userRef, {
      pendingDeletion: true,
      deletionDate: Timestamp.fromDate(deletionDate),
      deletionReason: reason,
    });
  } catch (error) {
    console.error('Error scheduling user deletion:', error);
    throw new Error('Failed to schedule user deletion');
  }
};

/**
 * Cancel user deletion
 */
export const cancelUserDeletion = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      pendingDeletion: false,
      deletionDate: null,
      deletionReason: null,
    });
  } catch (error) {
    console.error('Error canceling user deletion:', error);
    throw new Error('Failed to cancel user deletion');
  }
};

/**
 * Get a single user by ID
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    const data = userSnap.data();

    return {
      id: userSnap.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role,
      studentId: data.studentId,
      course: data.course,
      section: data.section,
      yearLevel: data.yearLevel,
      department: data.department,
      isVerified: data.isVerified || false,
      isPending: data.isPending || false,
      pendingDeletion: data.pendingDeletion || false,
      deletionDate: data.deletionDate?.toDate?.()?.toISOString() || data.deletionDate,
      deletionReason: data.deletionReason,
      theme: data.theme || 'system',
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('Failed to fetch user from database');
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const updateData: Record<string, any> = { ...updates };

    // Convert timestamps if needed
    if (updates.createdAt && typeof updates.createdAt === 'string') {
      updateData.createdAt = Timestamp.fromDate(new Date(updates.createdAt));
    }

    await updateDoc(userRef, updateData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile');
  }
};

/**
 * Check if user exists by email
 */
export const userExistsByEmail = async (email: string): Promise<boolean> => {
  try {
    const q = query(collection(db, USERS_COLLECTION), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const q = query(collection(db, USERS_COLLECTION), where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const docSnapshot = querySnapshot.docs[0];
    const data = docSnapshot.data();

    return {
      id: docSnapshot.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role,
      studentId: data.studentId,
      course: data.course,
      section: data.section,
      yearLevel: data.yearLevel,
      department: data.department,
      isVerified: data.isVerified || false,
      isPending: data.isPending || false,
      pendingDeletion: data.pendingDeletion || false,
      deletionDate: data.deletionDate?.toDate?.()?.toISOString() || data.deletionDate,
      deletionReason: data.deletionReason,
      theme: data.theme || 'system',
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
    };
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
};
