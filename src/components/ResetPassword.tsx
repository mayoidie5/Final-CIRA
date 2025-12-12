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
  const [codeType, setCodeType] = useState<'password' | 'email' | null>(null);

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

  // Verify the code on mount - only handle password reset codes
  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        setError('Invalid reset link. No code provided.');
        setVerifying(false);
        return;
      }

      try {
        // Try password reset code verification
        const resetEmail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(resetEmail);
        setCodeType('password');
        setVerifying(false);
        console.log('✅ Password reset code verified for:', resetEmail);
      } catch (err: any) {
        console.error('❌ Code verification error:', err);
        setError('This link is invalid or has expired. Please request a new one.');
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
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {codeType === 'email' ? 'Email Verification' : 'Reset Password'}
            </h1>
          </div>
          
          {/* Subtitle */}
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {codeType === 'email' 
              ? 'Your email has been verified' 
              : 'Create a strong new password to secure your account'}
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
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {codeType === 'email' ? 'Email Verified!' : 'Password Reset!'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {codeType === 'email' 
                      ? 'Your email has been successfully verified.' 
                      : 'Your password has been successfully reset.'}
                  </p>
                  <a
                    href="/signin"
                    className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Sign In
                  </a>
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
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm transition-all ${
                          confirmPassword && newPassword !== confirmPassword
                            ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                        }`}
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
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">❌ Passwords do not match</p>
                    )}
                  </div>

                  {/* Password Requirements */}
                  {newPassword && !allRequirementsMet && (
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
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md disabled:shadow-none mt-2"
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
            <p className="text-gray-500 dark:text-gray-400 text-sm">College of Engineering Information Technology</p>
          </div>
        </div>
      </div>
    </div>
  );
};
