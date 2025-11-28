import { db } from '../firebase';
import { doc, updateDoc, query, collection, where, getDocs, deleteField } from 'firebase/firestore';

export const getPendingClassReps = async () => {
  try {
    const q = query(
      collection(db, 'users'),
      where('isPending', '==', true),
      where('requestedRole', '==', 'class_rep')
    );
    
    const querySnapshot = await getDocs(q);
    const pendingReps = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return { success: true, data: pendingReps };
  } catch (error: any) {
    console.error('Error fetching pending class reps:', error);
    return { success: false, error: error.message || 'Failed to fetch pending class reps' };
  }
};

export const approveClassRep = async (userId: string) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      role: 'class_rep',
      isPending: false,
      requestedRole: deleteField(),
      approvedAt: new Date().toISOString(),
    });
    
    return { success: true, message: 'Class representative approved successfully' };
  } catch (error: any) {
    console.error('Error approving class rep:', error);
    return { success: false, error: error.message || 'Failed to approve class representative' };
  }
};

export const rejectClassRep = async (userId: string, reason: string) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      isPending: false,
      requestedRole: deleteField(),
      rejectionReason: reason,
      rejectedAt: new Date().toISOString(),
    });
    
    return { success: true, message: 'Class representative request rejected' };
  } catch (error: any) {
    console.error('Error rejecting class rep:', error);
    return { success: false, error: error.message || 'Failed to reject class representative' };
  }
};
