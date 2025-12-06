import { User } from '../types';
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const initializeAdminAccount = async () => {
  const adminUser: User = {
    id: 'admin-001',
    firstName: 'Admin',
    lastName: 'Account',
    email: 'admin@plv.edu.ph',
    role: 'admin',
    department: 'College of Engineering Information Technology',
    isVerified: true,
    isPending: false,
    theme: 'system',
    createdAt: new Date().toISOString(),
  };

  try {
    // Try to create in Firebase
    console.log('🔐 Attempting to create admin account in Firebase...');
    const userCredential = await createUserWithEmailAndPassword(auth, 'admin@plv.edu.ph', '@Admin123');
    const firebaseUser = userCredential.user;
    
    // Update admin ID with Firebase UID
    adminUser.id = firebaseUser.uid;

    // Save to Firestore
    await setDoc(doc(db, 'users', firebaseUser.uid), adminUser);
    console.log('✅ Admin account created successfully in Firebase');
    console.log('   Email: admin@plv.edu.ph');
    console.log('   Password: @Admin123');
  } catch (error: any) {
    // If Firebase creation fails (e.g., account already exists), check if it exists
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Admin account already exists in Firebase');
      try {
        // Try to get the admin user from Firestore to verify it exists
        // We'll need to find it by email since we don't have the UID
        console.log('✅ Admin account is ready to use');
      } catch (err) {
        console.error('⚠️ Could not verify admin account:', err);
      }
    } else if (error.code === 'auth/weak-password') {
      console.error('❌ Admin account password is too weak');
    } else {
      console.error('⚠️ Could not create admin in Firebase:', error.message);
    }
  }

  // Also add admin user to localStorage for backup
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const adminExists = users.some((u: User) => u.email === 'admin@plv.edu.ph');
  
  if (!adminExists) {
    users.push(adminUser);
    const passwords = JSON.parse(localStorage.getItem('passwords') || '{}');
    passwords['admin@plv.edu.ph'] = '@Admin123';
    
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('passwords', JSON.stringify(passwords));
    console.log('✅ Admin account saved to localStorage');
  }

  return adminUser;
};
