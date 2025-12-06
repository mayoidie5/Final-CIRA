import { User } from '../types';

export const initializeAdminAccount = () => {
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

  // Get existing users and passwords from localStorage
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const passwords = JSON.parse(localStorage.getItem('passwords') || '{}');

  // Check if admin already exists
  const adminExists = users.some((u: User) => u.email === 'admin@plv.edu.ph');

  if (!adminExists) {
    // Add admin user
    users.push(adminUser);
    passwords['admin@plv.edu.ph'] = '@Admin123';

    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('passwords', JSON.stringify(passwords));

    console.log('Admin account created successfully');
    console.log('Email: admin@plv.edu.ph');
    console.log('Password: @Admin123');
  } else {
    console.log('Admin account already exists');
  }

  return adminUser;
};
