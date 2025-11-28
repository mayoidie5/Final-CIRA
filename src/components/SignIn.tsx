import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import navyLogo from '../assets/MainLogoNavyBlue.png';
import whiteLogo from '../assets/MainLogoWhite.png';

interface SignInProps {
  onSwitchToSignUp: () => void;
  onSignInSuccess: () => void;
}

export const SignIn: React.FC<SignInProps> = ({ onSwitchToSignUp, onSignInSuccess }) => {
  const { login, resendVerification } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const current = (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const isEmailValid = (email: string) => {
    return email.endsWith('@plv.edu.ph');
  };

  const hasFieldError = (fieldName: string): boolean => {
    switch (fieldName) {
      case 'email':
        if (formData.email === '') {
          return !touched.email ? false : true;
        }
        return !isEmailValid(formData.email);
      case 'password':
        return !touched.password && !formData.password ? false : !formData.password;
      default:
        return false;
    }
  };

  const getErrorMessage = (fieldName: string): string => {
    switch (fieldName) {
      case 'email':
        if (!formData.email) return !touched.email ? '' : 'Email is required';
        if (!isEmailValid(formData.email)) return 'Email must end with @plv.edu.ph';
        return '';
      case 'password':
        if (!formData.password) return !touched.password ? '' : 'Password is required';
        return '';
      default:
        return '';
    }
  };

  const handleFieldBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    // Remove @plv.edu.ph if present
    if (input.includes('@plv.edu.ph')) {
      input = input.replace('@plv.edu.ph', '');
    }
    // Auto-append @plv.edu.ph
    const fullEmail = input ? input + '@plv.edu.ph' : '';
    setFormData(prev => ({ ...prev, email: fullEmail }));

    // Immediately set the value and cursor position
    const emailInput = e.target as HTMLInputElement;
    const cursorPos = input.length;
    
    // Use requestAnimationFrame to ensure DOM update before setting cursor
    requestAnimationFrame(() => {
      emailInput.value = fullEmail;
      emailInput.setSelectionRange(cursorPos, cursorPos);
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, password: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    
    // Mark fields as touched
    setTouched({ email: true, password: true });

    // Validate fields
    if (!formData.email || !isEmailValid(formData.email)) {
      setError('Please enter a valid email');
      return;
    }
    if (!formData.password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    const result = await login(formData.email, formData.password);
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
    await resendVerification(formData.email);
    alert('Verification email sent!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          {/* Logo Section */}
          <div className="p-8 text-center relative">
            <button
              onClick={toggleTheme}
              className="absolute top-4 right-4 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <img
              src={isDark ? whiteLogo : navyLogo}
              alt="CIRA logo"
              style={{ maxWidth: '180px', height: 'auto' }}
              className="mx-auto mb-2 object-contain"
            />
            <h1 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Computer Issue Reporting Application</h1>
          </div>

          <div className="border-t border-gray-300 dark:border-gray-600"></div>

          {/* Form Section */}
          <div className="p-8">
            <h2 className="text-center text-gray-600 dark:text-gray-400 mb-6">Sign In</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Email (@plv.edu.ph only)</label>
                <div className="relative">
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleEmailChange}
                    onBlur={() => handleFieldBlur('email')}
                    className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    style={{ border: hasFieldError('email') ? '1px solid #ef4444' : '1px solid #d1d5db' }}
                    placeholder="username@plv.edu.ph"
                    required
                  />
                </div>
                {hasFieldError('email') && (
                  <p style={{ color: '#ef4444' }} className="text-sm mt-1">{getErrorMessage('email')}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handlePasswordChange}
                    onBlur={() => handleFieldBlur('password')}
                    style={{
                      borderColor: hasFieldError('password') ? '#ef4444' : '#d1d5db'
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white pr-10"
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
                {hasFieldError('password') && (
                  <p style={{ color: '#ef4444' }} className="text-sm mt-1">{getErrorMessage('password')}</p>
                )}
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

          <div className="border-t border-gray-300 dark:border-gray-600"></div>

          {/* College Footer Section */}
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">College of Engineering Information Technology</p>
          </div>
        </div>
      </div>
    </div>
  );
};
