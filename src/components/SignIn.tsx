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
  const { login, resendVerification } = useAuth();
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [loading, setLoading] = useState(false);

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
    </div>
  );
};
