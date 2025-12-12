import React, { useState, useEffect } from 'react';
import { AlertCircle, Moon, Sun, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../config/firebase';

interface ResetPasswordProps {
  oobCode?: string;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ oobCode }) => {
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);

  const isDark = theme === 'dark';

  // Password requirements
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecial: false,
  });

  const allRequirementsMet = Object.values(passwordRequirements).every(req => req);
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

  // Verify the reset code on mount
  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        setError('Invalid reset link. No code provided.');
        setVerifying(false);
        return;
      }

      try {
        // Verify the code and get the email
        const resetEmail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(resetEmail);
        setVerifying(false);
        console.log('✅ Password reset code verified for:', resetEmail);
      } catch (err: any) {
        console.error('❌ Code verification error:', err);
        setError('This reset link is invalid or has expired. Please request a new one.');
        setVerifying(false);
      }
    };

    verifyCode();
  }, [oobCode]);

  // Update password requirements as user types
  useEffect(() => {
    setPasswordRequirements({
      minLength: newPassword.length >= 8,
      hasUpperCase: /[A-Z]/.test(newPassword),
      hasLowerCase: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
    });
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate
    if (!allRequirementsMet) {
      setError('Password does not meet all requirements.');
      setLoading(false);
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (!oobCode) {
      setError('Reset code is missing. Please use a valid reset link.');
      setLoading(false);
      return;
    }

    try {
      // Confirm password reset with the code
      await confirmPasswordReset(auth, oobCode, newPassword);
      console.log('✅ Password reset successfully');
      setSuccess(true);

      // Redirect to signin after 3 seconds
      setTimeout(() => {
        window.location.href = window.location.origin + '/signin';
      }, 3000);
    } catch (err: any) {
      console.error('❌ Password reset error:', err);
      setError('Failed to reset password. Please try again or request a new reset link.');
    }

    setLoading(false);
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <button
        onClick={() => theme === 'light' ? setTheme('dark') : setTheme('light')}
        className="fixed top-4 right-4 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? (
          <Moon size={20} className="text-gray-800" />
        ) : (
          <Sun size={20} className="text-yellow-400" />
        )}
      </button>

      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8">
          {/* Section 1: Header with Logo and Title */}
        <div className="text-center mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
          {/* Logo */}
          <img
            src={isDark ? '/assets/MainLogoWhite.png' : '/assets/MainLogoNavyBlue.png'}
            alt="Logo"
            className="w-auto mx-auto mb-6"
            style={{ height: '120px' }}
          />
          
          {/* Title with Icon */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <Lock size={32} className="text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reset Password</h1>
          </div>
          
          {/* Subtitle */}
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Create a strong new password to secure your account
          </p>
          </div>

          {/* Horizontal Line */}
          <hr className="my-8 border-gray-300 dark:border-gray-600" />

          {/* Section 2: Reset Password Form */}
          <div className="mb-8 pb-8">
            {success ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <CheckCircle size={64} className="text-green-500 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Password Reset!</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your password has been successfully reset. You'll be redirected to sign in shortly.
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <AlertCircle size={64} className="text-red-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Invalid Reset Link</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                  <a
                    href="/forgot-password"
                    className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Request New Reset Link
                  </a>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    Create a strong password for your account. It must contain at least 8 characters with uppercase, lowercase, numbers, and special characters.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm"
                      />
                    </div>
                  </div>

                  {/* New Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm transition-all"
                        placeholder="Enter your new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm transition-all"
                        placeholder="Confirm your new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  {newPassword && !allRequirementsMet && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <p className="text-amber-900 dark:text-amber-300 font-medium text-sm mb-3">Password Requirements:</p>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm">
                          <span className={passwordRequirements.minLength ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>
                            {passwordRequirements.minLength ? '✓' : '○'}
                          </span>
                          <span className={passwordRequirements.minLength ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                            At least 8 characters
                          </span>
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <span className={passwordRequirements.hasUpperCase ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>
                            {passwordRequirements.hasUpperCase ? '✓' : '○'}
                          </span>
                          <span className={passwordRequirements.hasUpperCase ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                            One uppercase letter
                          </span>
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <span className={passwordRequirements.hasLowerCase ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>
                            {passwordRequirements.hasLowerCase ? '✓' : '○'}
                          </span>
                          <span className={passwordRequirements.hasLowerCase ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                            One lowercase letter
                          </span>
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <span className={passwordRequirements.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>
                            {passwordRequirements.hasNumber ? '✓' : '○'}
                          </span>
                          <span className={passwordRequirements.hasNumber ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                            One number
                          </span>
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <span className={passwordRequirements.hasSpecial ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>
                            {passwordRequirements.hasSpecial ? '✓' : '○'}
                          </span>
                          <span className={passwordRequirements.hasSpecial ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                            One special character
                          </span>
                        </li>
                      </ul>
                    </div>
                  )}

                  {/* Password Match Status */}
                  {passwordsMatch && allRequirementsMet && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
                      <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                      <p className="text-green-700 dark:text-green-400 text-sm font-medium">Passwords match</p>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !allRequirementsMet || !passwordsMatch}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 rounded-lg transition-all font-medium shadow-md hover:shadow-lg disabled:shadow-none disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Resetting Password...
                      </div>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Horizontal Line */}
          <hr className="my-8 border-gray-300 dark:border-gray-600" />

          {/* Section 3: Footer */}
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">College of Engineering Information Technology</p>
          </div>
        </div>
      </div>
    </div>
  );
};
