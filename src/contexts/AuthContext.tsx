import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { initializeAdminAccount } from '../utils/initAdmin';
import { sendVerificationEmail } from '../utils/emailService';
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, collection, getDoc, updateDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>;
  logout: () => void;
  signup: (userData: Partial<User> & { password: string; confirmPassword: string }) => Promise<{ success: boolean; error?: string }>;
  updateUser: (updates: Partial<User>) => void;
  resendVerification: (email: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Initialize admin account on first load
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

  const login = async (email: string, password: string) => {
    try {
      // Authenticate with Firebase
      let userCredential = await signInWithEmailAndPassword(auth, email, password);
      let firebaseUser = userCredential.user;

      // Get user data from Firestore
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

      // CHECK FIRESTORE FOR VERIFICATION STATUS - THIS IS THE SOURCE OF TRUTH
      // Users cannot bypass this by clearing localStorage
      if (!foundUser.isVerified) {
        console.log('📧 Email verification required for:', email);
        console.log('   isVerified in Firestore:', foundUser.isVerified);
        return { success: false, needsVerification: true, error: 'Email not verified. Please check your inbox for the verification link.' };
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
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email!, userData.password!);
      const firebaseUser = userCredential.user;

      // Create new user object
      const newUser: User = {
        id: firebaseUser.uid,
        firstName: userData.firstName!,
        lastName: userData.lastName!,
        email: userData.email!,
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

      // Send verification email
      try {
        await sendVerificationEmail(userData.email!);
        console.log('✅ Verification email sent to:', userData.email);
      } catch (error) {
        console.error('⚠️ Failed to send verification email:', error);
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

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, updateUser, resendVerification, sendPasswordReset }}>
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
