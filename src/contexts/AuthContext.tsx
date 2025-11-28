import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { auth, db } from '../firebase';
import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>;
  logout: () => Promise<void>;
  signup: (userData: Partial<User> & { password: string; confirmPassword: string }) => Promise<{ success: boolean; error?: string }>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  resendVerification: (email?: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  checkEmailVerification: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapFirestoreToUser = (id: string, data: any): User => {
  return {
    id,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    email: data.email || '',
    role: data.role || 'student',
    studentId: data.studentId,
    course: data.course,
    section: data.section,
    yearLevel: data.yearLevel,
    department: data.department || 'College of Engineering Information Technology',
    isVerified: !!data.isVerified,
    isPending: data.isPending,
    pendingDeletion: data.pendingDeletion,
    deletionDate: data.deletionDate,
    deletionReason: data.deletionReason,
    theme: data.theme || 'system',
    createdAt: data.createdAt || new Date().toISOString(),
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        localStorage.removeItem('currentUser');
        return;
      }

      // Block access if email is not verified
      if (!fbUser.emailVerified) {
        setUser(null);
        localStorage.removeItem('currentUser');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          const u = mapFirestoreToUser(fbUser.uid, userDoc.data());
          setUser(u);
          localStorage.setItem('currentUser', JSON.stringify(u));
        } else {
          // If no user doc, create a minimal one
          const minimal = {
            firstName: fbUser.displayName?.split(' ')[0] || '',
            lastName: fbUser.displayName?.split(' ').slice(1).join(' ') || '',
            email: fbUser.email || '',
            role: 'student',
            department: 'College of Engineering Information Technology',
            isVerified: fbUser.emailVerified || false,
            createdAt: new Date().toISOString(),
          } as any;
          await setDoc(doc(db, 'users', fbUser.uid), minimal);
          const u = mapFirestoreToUser(fbUser.uid, minimal);
          setUser(u);
          localStorage.setItem('currentUser', JSON.stringify(u));
        }
      } catch (err) {
        console.error('Error fetching user doc:', err);
      }
    });

    return () => unsub();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      
      // Reload user to get latest emailVerified status from Firebase
      await cred.user.reload();
      
      if (!cred.user.emailVerified) {
        return { success: false, needsVerification: true, error: 'Email not verified' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const logout = async () => {
    await fbSignOut(auth);
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const signup = async (userData: Partial<User> & { password: string; confirmPassword: string }) => {
    if (!userData.email?.endsWith('@plv.edu.ph')) {
      return { success: false, error: 'Email must be from @plv.edu.ph domain' };
    }

    if (userData.password !== userData.confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, userData.email!, userData.password);
      await sendEmailVerification(cred.user);

      const newUser = {
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email!,
        role: userData.role || 'student',
        studentId: userData.studentId,
        department: userData.department || 'College of Engineering Information Technology',
        isVerified: false,
        isPending: userData.role === 'class_rep',
        theme: userData.theme || 'system',
        createdAt: new Date().toISOString(),
      } as any;

      await setDoc(doc(db, 'users', cred.user.uid), newUser);

      // Sign out the user immediately so they can't access the dashboard without verifying email
      await fbSignOut(auth);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Signup failed' };
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.id), updates as any);
      const updated = { ...user, ...updates };
      setUser(updated);
      localStorage.setItem('currentUser', JSON.stringify(updated));
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  const resendVerification = async (email?: string) => {
    try {
      const current = auth.currentUser;
      if (current && !current.emailVerified) {
        await sendEmailVerification(current);
        return { success: true, message: 'Verification email sent! Check your inbox.' };
      } else if (email) {
        console.warn('Cannot resend - user not currently signed in');
        return { success: false, error: 'Please sign in first to resend verification email' };
      }
      return { success: false, error: 'No user to verify' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to resend verification email' };
    }
  };

  const checkEmailVerification = async () => {
    try {
      const current = auth.currentUser;
      if (current) {
        await current.reload();
        return current.emailVerified;
      }
      return false;
    } catch (err) {
      console.error('Error checking email verification:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, updateUser, resendVerification, checkEmailVerification }}>
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
