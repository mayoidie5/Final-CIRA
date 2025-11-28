import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export const createAdminAccount = async () => {
  try {
    // Create Firebase Auth user
    const cred = await createUserWithEmailAndPassword(
      auth,
      'admin@plv.edu.ph',
      '@Admin123'
    );

    // Update display name
    await updateProfile(cred.user, {
      displayName: 'Admin User',
    });

    // Create Firestore user document with admin role
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      email: 'admin@plv.edu.ph',
      firstName: 'Admin',
      lastName: 'User',
      displayName: 'Admin User',
      role: 'admin',
      department: 'Administration',
      isVerified: true, // Bypass email verification for admin
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Send verification email (for record)
    await sendEmailVerification(cred.user);

    return {
      success: true,
      message: 'Admin account created successfully!',
      email: 'admin@plv.edu.ph',
      password: '@Admin123',
    };
  } catch (error: any) {
    console.error('Error creating admin account:', error);
    return {
      success: false,
      error: error.message || 'Failed to create admin account',
    };
  }
};
