import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { MOCK_USERS, MOCK_PASSWORDS } from '../utils/mockData';
import { initializeAdminAccount } from '../utils/initAdmin';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>;
  logout: () => void;
  signup: (userData: Partial<User> & { password: string; confirmPassword: string }) => Promise<{ success: boolean; error?: string }>;
  updateUser: (updates: Partial<User>) => void;
  resendVerification: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Initialize admin account on first load
    initializeAdminAccount();

    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem('users') || JSON.stringify(MOCK_USERS));
    const foundUser = users.find((u: User) => u.email === email);

    if (!foundUser) {
      return { success: false, error: 'Invalid email or password' };
    }

    const passwords = JSON.parse(localStorage.getItem('passwords') || JSON.stringify(MOCK_PASSWORDS));
    if (passwords[email] !== password) {
      return { success: false, error: 'Invalid email or password' };
    }

    if (!foundUser.isVerified) {
      return { success: false, needsVerification: true, error: 'Email not verified' };
    }

    setUser(foundUser);
    localStorage.setItem('currentUser', JSON.stringify(foundUser));
    return { success: true };
  };

  const logout = () => {
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

    if (userData.studentId && !/^\d{2}-\d{4}$/.test(userData.studentId)) {
      return { success: false, error: 'Student ID must be in format XX-XXXX (6 digits)' };
    }

    if (userData.section && !/^\d{1}-\d{1,2}$/.test(userData.section)) {
      return { success: false, error: 'Year-Section must be in format X-X or X-XX (1 digit before dash, up to 2 after)' };
    }

    const users = JSON.parse(localStorage.getItem('users') || JSON.stringify(MOCK_USERS));
    const passwords = JSON.parse(localStorage.getItem('passwords') || JSON.stringify(MOCK_PASSWORDS));

    if (users.find((u: User) => u.email === userData.email)) {
      return { success: false, error: 'Email already exists' };
    }

    const newUser: User = {
      id: Date.now().toString(),
      firstName: userData.firstName!,
      lastName: userData.lastName!,
      email: userData.email!,
      role: userData.role!,
      studentId: userData.studentId,
      department: 'College of Engineering Information Technology',
      isVerified: false,
      isPending: userData.role === 'class_rep',
      theme: 'system',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    passwords[userData.email!] = userData.password;

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('passwords', JSON.stringify(passwords));

    return { success: true };
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
    // Mock resend verification
    console.log('Resending verification email to:', email);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, updateUser, resendVerification }}>
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
