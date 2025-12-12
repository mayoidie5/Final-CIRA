import React, { useState } from 'react';
import { AlertCircle, Moon, Sun, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface ForgotPasswordProps {
  onBackToLogin?: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const { sendPasswordReset } = useAuth();
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const isDark = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    // Auto-append @plv.edu.ph to email if not already present
    const fullEmail = email.includes('@') ? email : `${email}@plv.edu.ph`;

    const result = await sendPasswordReset(fullEmail);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setEmail('');
      // Go back to login after 3 seconds
      setTimeout(() => {
        window.location.href = window.location.origin + '/?page=signin';
      }, 3000);
    } else {
      setError(result.error || 'Failed to send reset link');
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.trim();
    
    // Remove @plv.edu.ph if it exists to prevent duplication
    if (value.endsWith('@plv.edu.ph')) {
      value = value.replace('@plv.edu.ph', '');
    }
    
    setEmail(value);
  };

  const handleEmailBlur = () => {
    if (email && !email.includes('@')) {
      setEmail(`${email}@plv.edu.ph`);
    }
  };

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
          {/* Section 1: Logo and Title */}
          <div className="text-center mb-8 pb-8 border-b-2 border-gray-300 dark:border-gray-600">
            <img
              src={isDark ? '/assets/MainLogoWhite.png' : '/assets/MainLogoNavyBlue.png'}
              alt="Logo"
              className="w-auto mx-auto mb-4"
              style={{ height: '150px' }}
            />
            <h1 className="text-blue-600 dark:text-blue-400 text-xl sm:text-2xl">Reset Your Password</h1>
          </div>

          {/* Horizontal Line */}
          <hr className="my-8 border-gray-300 dark:border-gray-600" />

          {/* Section 2: Reset Password Form */}
          <div className="mb-8 pb-8">
            {success ? (
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle size={48} className="text-green-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Reset Link Sent!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Check your email for the password reset link. This window will close in a few seconds.
                </p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={email}
                        onChange={handleEmailChange}
                        onBlur={handleEmailBlur}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="your.email"
                        required
                        autoComplete="email"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                        @plv.edu.ph
                      </span>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                      <AlertCircle size={20} />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Remember your password?{' '}
                    <button
                      onClick={() => window.location.href = window.location.origin + '/?page=signin'}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Back to Sign In
                    </button>
                  </p>
                </div>
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
