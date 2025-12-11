import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Restore sample tickets to Firestore
 * This will add back some sample data for testing
 */
export const restoreSampleTickets = async () => {
  try {
    console.log('📝 Restoring sample tickets...');

    const sampleTickets = [
      {
        userId: 'jNnzWTiUrLfOkCwM3sGpWP2AnBu1',
        campus: 'Maysan Campus',
        building: 'Comlab',
        room: 'Comlab 201 2nd Flr',
        unitId: 'CL-201-01',
        issueType: 'Hardware',
        issueSubtype: 'Monitor not working',
        issueDescription: 'The monitor in the comlab is not displaying anything',
        images: [],
        status: 'requested',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: [],
      },
      {
        userId: 'jNnzWTiUrLfOkCwM3sGpWP2AnBu1',
        campus: 'Annex Campus',
        building: 'Lab Building',
        room: 'Lab 102',
        unitId: 'AX-102-02',
        issueType: 'Software',
        issueSubtype: 'Software installation',
        issueDescription: 'Need to install Visual Studio Code on lab computers',
        images: [],
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: [],
      },
      {
        userId: 'jNnzWTiUrLfOkCwM3sGpWP2AnBu1',
        campus: 'Maysan Campus',
        building: 'Comlab',
        room: 'Comlab 203',
        unitId: 'CL-203-03',
        issueType: 'Network',
        issueSubtype: 'Internet connectivity',
        issueDescription: 'Internet connection is very slow in this area',
        images: [],
        status: 'resolved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: [],
      },
    ];

    let addedCount = 0;
    for (const ticket of sampleTickets) {
      try {
        const docRef = await addDoc(collection(db, 'tickets'), ticket);
        addedCount++;
        console.log(`✅ Added ticket ${addedCount}/${sampleTickets.length}: ${docRef.id}`);
      } catch (error) {
        console.error(`❌ Failed to add ticket:`, error);
      }
    }

    console.log(`✅ Successfully restored ${addedCount} sample tickets!`);
    return addedCount;
  } catch (error) {
    console.error('❌ Error restoring tickets:', error);
    throw error;
  }
};
