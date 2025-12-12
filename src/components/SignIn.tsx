import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import logoNavyBlue from '../../assets/MainLogoNavyBlue.png';
import logoWhite from '../../assets/MainLogoWhite.png';

interface SignInProps {
  onSwitchToSignUp: () => void;
  onSignInSuccess: () => void;
}

export const SignIn: React.FC<SignInProps> = ({ onSwitchToSignUp, onSignInSuccess }) => {
  const { login, resendVerification, sendPasswordReset } = useAuth();
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const isDark = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    setLoading(true);

    // Auto-append @plv.edu.ph to email if not already present
    const fullEmail = email.includes('@') ? email : `${email}@plv.edu.ph`;

    const result = await login(fullEmail, password);
    setLoading(false);

    if (result.success) {
      onSignInSuccess();
    } else if (result.needsVerification) {
      setNeedsVerification(true);
      setError(result.error || '');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleResendVerification = async () => {
    const fullEmail = email.includes('@') ? email : `${email}@plv.edu.ph`;
    await resendVerification(fullEmail);
    alert('Verification email sent!');
  };

  const handleForgotPassword = async () => {
    setForgotPasswordError('');
    setForgotPasswordMessage('');
    setForgotPasswordLoading(true);

    // Ensure email has domain if not already present
    const resetEmail = forgotPasswordEmail.includes('@') 
      ? forgotPasswordEmail 
      : `${forgotPasswordEmail}@plv.edu.ph`;

    const result = await sendPasswordReset(resetEmail);
    setForgotPasswordLoading(false);

    if (result.success) {
      setForgotPasswordMessage('Password reset link has been sent to your email. Please check your inbox.');
      setForgotPasswordEmail('');
      // Close modal after 3 seconds
      setTimeout(() => {
        setShowForgotPasswordModal(false);
      }, 3000);
    } else {
      setForgotPasswordError(result.error || 'Failed to send password reset email');
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
              src={isDark ? logoWhite : logoNavyBlue}
              alt="Logo"
              className="w-auto mx-auto mb-4"
              style={{ height: '150px' }}
            />
            <h1 className="text-blue-600 dark:text-blue-400 text-xl sm:text-2xl">Comlab Issue Reporting Application</h1>
          </div>

          {/* Horizontal Line */}
          <hr className="my-8 border-gray-300 dark:border-gray-600" />

          {/* Section 2: Sign In Form */}
          <div className="mb-8 pb-8 border-b-2 border-gray-300 dark:border-gray-600">
            {/* Form Section */}
            <form onSubmit={handleSubmit} className="space-y-4" style={{ marginTop: '2rem' }}>
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

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(true)}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {needsVerification && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-400 mb-2">
                  Your email is not verified. Please check your inbox.
                </p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Resend verification email
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Sign In Toggle */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignUp}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Sign Up
              </button>
            </p>
          </div>
          </div>

          {/* Horizontal Line */}
          <hr className="my-8 border-gray-300 dark:border-gray-600" />

          {/* Section 3: Footer */}
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">College of Engineering Information Technology</p>
          </div>
        </div>
      </div>
      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Reset Password</h2>
            
            {forgotPasswordMessage ? (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-4">
                <p className="text-green-700 dark:text-green-300 text-sm">{forgotPasswordMessage}</p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={forgotPasswordEmail}
                      onChange={(e) => {
                        let value = e.target.value.trim();
                        if (value.endsWith('@plv.edu.ph')) {
                          value = value.replace('@plv.edu.ph', '');
                        }
                        setForgotPasswordEmail(value);
                      }}
                      onBlur={() => {
                        if (forgotPasswordEmail && !forgotPasswordEmail.includes('@')) {
                          setForgotPasswordEmail(`${forgotPasswordEmail}@plv.edu.ph`);
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="your.email"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                      @plv.edu.ph
                    </span>
                  </div>
                </div>

                {forgotPasswordError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 mb-4">
                    <AlertCircle size={20} />
                    <span className="text-sm">{forgotPasswordError}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleForgotPassword}
                    disabled={forgotPasswordLoading || !forgotPasswordEmail}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  <button
                    onClick={() => {
                      setShowForgotPasswordModal(false);
                      setForgotPasswordEmail('');
                      setForgotPasswordError('');
                      setForgotPasswordMessage('');
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
