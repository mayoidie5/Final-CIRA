import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, Moon, Sun, Mail, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import navyLogo from '../assets/MainLogoNavyBlue.png';
import whiteLogo from '../assets/MainLogoWhite.png';

interface SignInProps {
  onSwitchToSignUp: () => void;
  onSignInSuccess: () => void;
}

export const SignIn: React.FC<SignInProps> = ({ onSwitchToSignUp, onSignInSuccess }) => {
  const { login, resendVerification, checkEmailVerification } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');

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
    setResendLoading(true);
    setVerificationMessage('');
    const result = await resendVerification(formData.email);
    setResendLoading(false);
    
    if (result.success) {
      setVerificationMessage(result.message || 'Verification email sent!');
      setTimeout(() => setVerificationMessage(''), 5000);
    } else {
      setError(result.error || 'Failed to resend verification email');
    }
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

              {verificationMessage && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400">
                  <CheckCircle size={20} />
                  <span>{verificationMessage}</span>
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

      {/* Email Verification Modal */}
      {needsVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
                  <Mail size={48} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Email Verification Required
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We've sent a verification link to:
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6 border border-blue-200 dark:border-blue-800">
                <p className="text-blue-900 dark:text-blue-300 font-semibold break-all">
                  {formData.email}
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-900 dark:text-amber-300">
                    📧 Click the link in your <strong>Outlook</strong> email to verify your account
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    💡 Check your spam/junk folder if you don't see the email
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <RefreshCw size={18} className={resendLoading ? 'animate-spin' : ''} />
                  {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setNeedsVerification(false)}
                  className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
