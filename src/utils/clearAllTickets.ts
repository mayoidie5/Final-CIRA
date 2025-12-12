import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Delete all tickets from Firestore
 * WARNING: This will permanently delete all tickets!
 */
export const deleteAllTickets = async () => {
  try {
    console.log('🗑️  Starting to delete all tickets...');
    
    // Get all tickets
    const ticketsSnapshot = await getDocs(collection(db, 'tickets'));
    console.log(`📊 Found ${ticketsSnapshot.size} tickets to delete`);
    
    // Delete each ticket
    let deletedCount = 0;
    for (const ticketDoc of ticketsSnapshot.docs) {
      try {
        await deleteDoc(doc(db, 'tickets', ticketDoc.id));
        deletedCount++;
        console.log(`✅ Deleted ticket ${deletedCount}/${ticketsSnapshot.size}: ${ticketDoc.id}`);
      } catch (error) {
        console.error(`❌ Failed to delete ticket ${ticketDoc.id}:`, error);
      }
    }
    
    console.log(`✅ Successfully deleted ${deletedCount} tickets!`);
    return deletedCount;
  } catch (error) {
    console.error('❌ Error deleting all tickets:', error);
    throw error;
  }
};
