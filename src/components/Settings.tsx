import React, { useState } from 'react';
import { X, Save, User, Mail, Building2, Shield, Key, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsProps {
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const { user, updateUser, changePassword } = useAuth();
  const { theme, setTheme } = useTheme();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    department: user?.department || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Password validation for new password
  const passwordRequirements = {
    minLength: passwordData.newPassword.length >= 8,
    hasUpperCase: /[A-Z]/.test(passwordData.newPassword),
    hasLowerCase: /[a-z]/.test(passwordData.newPassword),
    hasNumber: /[0-9]/.test(passwordData.newPassword),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword),
  };

  const allRequirementsMet = Object.values(passwordRequirements).every(req => req);
  const passwordsMatch = passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword;

  const handleSave = () => {
    updateUser(formData);
    alert('Settings saved successfully!');
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setPasswordError('');
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    // Validation
    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (!passwordData.newPassword) {
      setPasswordError('New password is required');
      return;
    }
    if (!allRequirementsMet) {
      setPasswordError('Password does not meet all requirements');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    // Change password
    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    
    if (result.success) {
      setPasswordSuccess(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess(false);
      }, 2000);
    } else {
      setPasswordError(result.error || 'Failed to change password');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-lg sm:text-xl text-gray-800 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Profile Information */}
          <div>
            <h3 className="text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <User size={20} />
              Profile Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Mail size={16} />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400"
                />
                <p className="text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Building2 size={16} />
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Shield size={16} />
                  Role
                </label>
                <input
                  type="text"
                  value={
                    user?.role === 'admin' ? 'Admin' :
                    user?.role === 'class_rep' ? 'Class Representative' :
                    'Student'
                  }
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400"
                />
              </div>

              {user?.studentId && (
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Student ID</label>
                  <input
                    type="text"
                    value={user.studentId}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Theme Settings */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Key size={20} />
              Security
            </h3>
            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Change Password
              </button>
            ) : (
              <div className="space-y-4">
                {passwordSuccess && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                    <p className="text-green-700 dark:text-green-400">✅ Password changed successfully!</p>
                  </div>
                )}
                {passwordError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                    <p className="text-red-700 dark:text-red-400">❌ {passwordError}</p>
                  </div>
                )}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your current password"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your new password"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm your new password"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Password Requirements */}
                {passwordData.newPassword && !allRequirementsMet && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-red-800 dark:text-red-300 mb-2">Password Requirements:</p>
                    <ul className="space-y-1 text-sm">
                      <li className={passwordRequirements.minLength ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {passwordRequirements.minLength ? '✓' : '✗'} At least 8 characters
                      </li>
                      <li className={passwordRequirements.hasUpperCase ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {passwordRequirements.hasUpperCase ? '✓' : '✗'} One uppercase letter
                      </li>
                      <li className={passwordRequirements.hasLowerCase ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {passwordRequirements.hasLowerCase ? '✓' : '✗'} One lowercase letter
                      </li>
                      <li className={passwordRequirements.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {passwordRequirements.hasNumber ? '✓' : '✗'} One number
                      </li>
                      <li className={passwordRequirements.hasSpecial ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {passwordRequirements.hasSpecial ? '✓' : '✗'} One special character
                      </li>
                    </ul>
                  </div>
                )}

                {/* Password Match Confirmation */}
                {allRequirementsMet && passwordsMatch && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400">
                    <CheckCircle size={20} />
                    <span>Password match ✓</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleChangePassword}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Update Password
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setPasswordError('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Theme Settings */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setTheme('light')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  theme === 'light'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-white border border-gray-300" />
                  <p className="text-gray-800 dark:text-white">Light</p>
                </div>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  theme === 'dark'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gray-800 border border-gray-700" />
                  <p className="text-gray-800 dark:text-white">Dark</p>
                </div>
              </button>

              <button
                onClick={() => setTheme('system')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  theme === 'system'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-r from-white to-gray-800 border border-gray-300" />
                  <p className="text-gray-800 dark:text-white">System</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-4">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
          >
            <Save size={20} />
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="px-6 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
