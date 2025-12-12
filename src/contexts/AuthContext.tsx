import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { initializeAdminAccount } from '../utils/initAdmin';
import { sendVerificationEmail, markEmailAsVerified } from '../utils/emailService';
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged, applyActionCode, isSignInWithEmailLink, parseActionCodeURL, updatePassword } from 'firebase/auth';
import { doc, setDoc, collection, getDoc, updateDoc, connectFirestoreEmulator, enableNetwork, getDocs } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>;
  logout: () => void;
  signup: (userData: Partial<User> & { password: string; confirmPassword: string }) => Promise<{ success: boolean; error?: string }>;
  updateUser: (updates: Partial<User>) => void;
  resendVerification: (email: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Initialize on first load
  useEffect(() => {
    const init = async () => {
      try {
        await initializeAdminAccount();
      } catch (error) {
        console.error('⚠️ Failed to initialize admin account:', error);
      }
    };
    
    init();

    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Handle Firebase verification links (run once on mount)
  useEffect(() => {
    const handleVerificationLink = async () => {
      try {
        const url = new URL(window.location.href);
        const mode = url.searchParams.get('mode');
        const oobCode = url.searchParams.get('oobCode');
        const apiKey = url.searchParams.get('apiKey');
        
        // Check if this is a Firebase auth action URL
        if (mode && oobCode) {
          console.log('🔗 Detected Firebase auth action URL');
          console.log('   Mode:', mode);
          console.log('   Code:', oobCode.substring(0, 10) + '...');
          
          try {
            // Try to parse the action code URL to verify it's valid
            const actionCodeInfo = await parseActionCodeURL(auth, oobCode);
            console.log('✅ Valid Firebase action code detected');
            console.log('   Operation:', actionCodeInfo.operation);
            
            // Apply the verification code - this marks the email as verified in Firebase Auth
            await applyActionCode(auth, oobCode);
            console.log('✅ Email verified successfully via Firebase');
            
            // Refresh the user's ID token to get updated claims
            const currentUser = auth.currentUser;
            if (currentUser) {
              await currentUser.reload();
              console.log('🔄 User reloaded with verified status');
              console.log('   Email verified:', currentUser.emailVerified);
            }
            
            // Show success message before closing
            console.log('🎉 Email verification complete! Closing tab in 2 seconds...');
            
            // Notify any other tabs that verification is complete
            localStorage.setItem('verificationComplete', JSON.stringify({
              timestamp: Date.now(),
              verified: true
            }));
            
            // Wait 2 seconds to show the success message, then close the tab
            setTimeout(() => {
              window.close();
            }, 2000);
            
          } catch (error: any) {
            console.error('❌ Failed to apply verification code:', error);
            if (error.code === 'auth/invalid-action-code') {
              console.error('   Error: Invalid or expired verification code');
            } else if (error.code === 'auth/expired-action-code') {
              console.error('   Error: Verification code has expired');
            } else {
              console.error('   Error details:', error);
            }
            
            // Try closing anyway after showing error for a bit
            setTimeout(() => {
              window.close();
            }, 3000);
          }
        }
      } catch (error) {
        console.error('❌ Error checking verification link:', error);
      }
    };

    handleVerificationLink();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Authenticate with Firebase
      let userCredential = await signInWithEmailAndPassword(auth, email, password);
      let firebaseUser = userCredential.user;

      // Force Firestore to refresh from server
      await enableNetwork(db);
      
      // Get user data from Firestore - with fresh read
      let userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // If this is the admin account and user data doesn't exist, create it
        if (email === 'admin@plv.edu.ph') {
          console.log('📝 Creating admin user document in Firestore...');
          const adminUser: User = {
            id: firebaseUser.uid,
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
          await setDoc(doc(db, 'users', firebaseUser.uid), adminUser);
          console.log('✅ Admin user document created');
          setUser(adminUser);
          localStorage.setItem('currentUser', JSON.stringify(adminUser));
          return { success: true };
        }
        return { success: false, error: 'User data not found' };
      }

      let foundUser = userDoc.data() as User;

      // CHECK FIREBASE AUTH EMAIL VERIFICATION - THIS IS THE SOURCE OF TRUTH
      console.log('🔍 Checking email verification status:');
      console.log('   User ID:', firebaseUser.uid);
      console.log('   Email from login:', email);
      console.log('   Email verified in Firebase Auth:', firebaseUser.emailVerified);
      console.log('   isVerified in Firestore:', foundUser.isVerified);
      
      // Use Firebase's emailVerified flag as the source of truth
      if (!firebaseUser.emailVerified) {
        console.log('📧 Email verification required for:', email);
        return { success: false, needsVerification: true, error: 'Email not verified. Please check your inbox for the verification link.' };
      }

      // If Firebase Auth shows verified but Firestore doesn't, update Firestore
      if (!foundUser.isVerified && firebaseUser.emailVerified) {
        console.log('🔄 Updating Firestore isVerified flag to match Firebase Auth');
        await markEmailAsVerified(firebaseUser.uid);
        foundUser.isVerified = true;
      }

      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      console.log('✅ Login successful:', foundUser.email);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // Handle Firebase specific errors
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        return { success: false, error: 'Invalid email or password' };
      } else if (error.code === 'auth/too-many-requests') {
        return { success: false, error: 'Too many login attempts. Please try again later.' };
      }
      
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('currentUser');
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const signup = async (userData: Partial<User> & { password: string; confirmPassword: string }) => {
    if (!userData.email?.endsWith('@plv.edu.ph')) {
      return { success: false, error: 'Email must be from @plv.edu.ph domain' };
    }

    if (userData.password !== userData.confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }

    if (userData.studentId && !/^\d{2}-\d{4}$/.test(userData.studentId)) {
      return { success: false, error: 'Student ID must be in format XX-XXXX (6 digits)' };
    }

    if (userData.section && !/^\d{1}-\d{1,2}$/.test(userData.section)) {
      return { success: false, error: 'Year-Section must be in format X-X or X-XX (1 digit before dash, up to 2 after)' };
    }

    try {
      // Normalize email to lowercase for consistency
      const normalizedEmail = userData.email!.toLowerCase();
      
      // Create user in Firebase Authentication first
      // This will fail if email is already in use, which handles the duplicate email case
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, userData.password!);
      const firebaseUser = userCredential.user;

      // Create new user object
      const newUser: User = {
        id: firebaseUser.uid,
        firstName: userData.firstName!,
        lastName: userData.lastName!,
        email: normalizedEmail,
        role: userData.role!,
        studentId: userData.studentId,
        course: userData.course,
        section: userData.section,
        department: 'College of Engineering Information Technology',
        isVerified: false,
        isPending: userData.role === 'class_rep',
        theme: 'system',
        createdAt: new Date().toISOString(),
      };

      // Save user to Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);

      // Also save to localStorage for backup
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      // Send Firebase's built-in verification email
      try {
        console.log('📧 About to send verification email to:', userData.email!);
        await sendVerificationEmail(userData.email!);
        console.log('✅ Verification email sent to:', userData.email);
      } catch (error) {
        console.error('⚠️ Failed to send verification email:', error);
        console.error('   Error details:', JSON.stringify(error));
        // Don't fail signup if email sending fails
      }

      return { success: true };
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      
      // Handle Firebase specific errors
      if (error.code === 'auth/email-already-in-use') {
        return { success: false, error: 'Email already registered' };
      } else if (error.code === 'auth/weak-password') {
        return { success: false, error: 'Password is too weak' };
      } else if (error.code === 'auth/invalid-email') {
        return { success: false, error: 'Invalid email format' };
      }
      
      return { success: false, error: error.message || 'Failed to create account' };
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: User) => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('users', JSON.stringify(users));
    }
  };
  const resendVerification = async (email: string) => {
    try {
      await sendVerificationEmail(email);
    } catch (error) {
      console.error('Failed to resend verification email:', error);
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Password reset email sent to:', email);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      
      if (error.code === 'auth/user-not-found') {
        return { success: false, error: 'No account found with this email address' };
      } else if (error.code === 'auth/invalid-email') {
        return { success: false, error: 'Invalid email address' };
      } else if (error.code === 'auth/too-many-requests') {
        return { success: false, error: 'Too many password reset attempts. Please try again later.' };
      }
      
      return { success: false, error: error.message || 'Failed to send password reset email' };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const currentUser = auth.currentUser;
      
      if (!currentUser || !currentUser.email) {
        return { success: false, error: 'No user logged in' };
      }

      // Re-authenticate the user with their current password before changing it
      // This is required by Firebase for security reasons
      console.log('🔐 Re-authenticating user before password change...');
      
      try {
        await signInWithEmailAndPassword(auth, currentUser.email, currentPassword);
      } catch (error: any) {
        if (error.code === 'auth/wrong-password') {
          return { success: false, error: 'Current password is incorrect' };
        }
        return { success: false, error: 'Failed to verify current password' };
      }

      // Now update the password
      await updatePassword(currentUser, newPassword);
      console.log('✅ Password changed successfully');
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ Password change error:', error);
      
      if (error.code === 'auth/weak-password') {
        return { success: false, error: 'New password is too weak. Use at least 6 characters.' };
      } else if (error.code === 'auth/requires-recent-login') {
        return { success: false, error: 'Please log in again before changing your password' };
      } else if (error.code === 'auth/operation-not-allowed') {
        return { success: false, error: 'Password change is not allowed for this account' };
      }
      
      return { success: false, error: error.message || 'Failed to change password' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, updateUser, resendVerification, sendPasswordReset, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
