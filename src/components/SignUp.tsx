import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import navyLogo from '../assets/MainLogoNavyBlue.png';
import whiteLogo from '../assets/MainLogoWhite.png';

interface SignUpProps {
  onSwitchToSignIn: () => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onSwitchToSignIn }) => {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'student' as UserRole,
    studentId: '',
    course: '',
    section: '',
    yearLevel: '',
    password: '',
    confirmPassword: '',
  });
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Password validation
  const passwordRequirements = {
    minLength: formData.password.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const allRequirementsMet = Object.values(passwordRequirements).every(req => req);
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  // Validation functions
  const isEmailValid = (email: string) => {
    return email.endsWith('@plv.edu.ph');
  };

  const isStudentIdValid = (id: string) => {
    return /^\d{2}-\d{4}$/.test(id);
  };

  const hasFieldError = (fieldName: string): boolean => {
    if (!touched[fieldName]) return false;

    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        return !formData[fieldName as keyof typeof formData];
      case 'email':
        return !formData.email || !isEmailValid(formData.email);
      case 'studentId':
        return !formData.studentId || !isStudentIdValid(formData.studentId);
      case 'course':
      case 'section':
      case 'yearLevel':
        return !formData[fieldName as keyof typeof formData];
      case 'password':
        return !formData.password || !allRequirementsMet;
      case 'confirmPassword':
        return !formData.confirmPassword || !passwordsMatch;
      default:
        return false;
    }
  };

  const getErrorMessage = (fieldName: string): string => {
    if (!touched[fieldName]) return '';

    switch (fieldName) {
      case 'firstName':
        return !formData.firstName ? 'First name is required' : '';
      case 'lastName':
        return !formData.lastName ? 'Last name is required' : '';
      case 'email':
        if (!formData.email) return 'Email is required';
        if (!isEmailValid(formData.email)) return 'Email must end with @plv.edu.ph';
        return '';
      case 'studentId':
        if (!formData.studentId) return 'Student ID is required';
        if (!isStudentIdValid(formData.studentId)) return 'Format must be XX-XXXX (e.g., 23-3302)';
        return '';
      case 'course':
        return !formData.course ? 'Course selection is required' : '';
      case 'section':
        return !formData.section ? 'Section selection is required' : '';
      case 'yearLevel':
        return !formData.yearLevel ? 'Year level selection is required' : '';
      case 'password':
        if (!formData.password) return 'Password is required';
        if (!allRequirementsMet) return 'Password does not meet all requirements';
        return '';
      case 'confirmPassword':
        if (!formData.confirmPassword) return 'Please confirm your password';
        if (!passwordsMatch) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    const result = await signup(formData);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        onSwitchToSignIn();
      }, 2000);
    } else {
      setError(result.error || 'Sign up failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          {/* Logo Section */}
          <div className="p-8 text-center relative">
            <button
              onClick={toggleTheme}
              className="absolute top-4 right-4 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              title="Toggle theme"
            >
              {isDark ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-gray-700" />}
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
            <h2 className="text-center text-gray-600 dark:text-gray-400 mb-6">Sign Up</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={handleFieldBlur}
                    className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    style={{ border: hasFieldError('firstName') ? '1px solid #ef4444' : '1px solid #d1d5db' }}
                    required
                  />
                  {hasFieldError('firstName') && (
                    <p style={{ color: '#ef4444' }} className="text-sm mt-1">{getErrorMessage('firstName')}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={handleFieldBlur}
                    className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    style={{ border: hasFieldError('lastName') ? '1px solid #ef4444' : '1px solid #d1d5db' }}
                    required
                  />
                  {hasFieldError('lastName') && (
                    <p style={{ color: '#ef4444' }} className="text-sm mt-1">{getErrorMessage('lastName')}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Email (@plv.edu.ph only)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleFieldBlur}
                  className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  style={{ border: hasFieldError('email') ? '1px solid #ef4444' : '1px solid #d1d5db' }}
                  placeholder="your.name@plv.edu.ph"
                  required
                />
                {hasFieldError('email') && (
                  <p style={{ color: '#ef4444' }} className="text-sm mt-1">{getErrorMessage('email')}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="student">Student</option>
                  <option value="class_rep">Class Representative</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Student ID (Format: XX-XXXX)</label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  onBlur={handleFieldBlur}
                  placeholder="23-3302"
                  className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  style={{ border: hasFieldError('studentId') ? '1px solid #ef4444' : '1px solid #d1d5db' }}
                  required
                />
                {hasFieldError('studentId') && (
                  <p style={{ color: '#ef4444' }} className="text-sm mt-1">{getErrorMessage('studentId')}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Course</label>
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    onBlur={handleFieldBlur}
                    className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    style={{ border: hasFieldError('course') ? '1px solid #ef4444' : '1px solid #d1d5db' }}
                    required
                  >
                    <option value="">Select Course</option>
                    <option value="BSIT">BSIT</option>
                    <option value="BSCS">BSCS</option>
                    <option value="BSCE">BSCE</option>
                    <option value="BSEE">BSEE</option>
                    <option value="BSME">BSME</option>
                    <option value="BSED">BSED</option>
                    <option value="BEED">BEED</option>
                  </select>
                  {hasFieldError('course') && (
                    <p style={{ color: '#ef4444' }} className="text-sm mt-1">{getErrorMessage('course')}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Year Level</label>
                  <select
                    name="yearLevel"
                    value={formData.yearLevel}
                    onChange={handleChange}
                    onBlur={handleFieldBlur}
                    className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    style={{ border: hasFieldError('yearLevel') ? '1px solid #ef4444' : '1px solid #d1d5db' }}
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                  {hasFieldError('yearLevel') && (
                    <p style={{ color: '#ef4444' }} className="text-sm mt-1">{getErrorMessage('yearLevel')}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Section</label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  onBlur={handleFieldBlur}
                  className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  style={{ border: hasFieldError('section') ? '1px solid #ef4444' : '1px solid #d1d5db' }}
                  required
                >
                  <option value="">Select Section</option>
                  <option value="1-1">1-1</option>
                  <option value="1-2">1-2</option>
                  <option value="1-3">1-3</option>
                  <option value="1-4">1-4</option>
                  <option value="1-5">1-5</option>
                  <option value="2-1">2-1</option>
                  <option value="2-2">2-2</option>
                  <option value="2-3">2-3</option>
                  <option value="2-4">2-4</option>
                  <option value="2-5">2-5</option>
                </select>
                {hasFieldError('section') && (
                  <p style={{ color: '#ef4444' }} className="text-sm mt-1">{getErrorMessage('section')}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleFieldBlur}
                    className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white pr-10"
                    style={{ border: hasFieldError('password') ? '1px solid #ef4444' : '1px solid #d1d5db' }}
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

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleFieldBlur}
                    className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white pr-10"
                    style={{ border: hasFieldError('confirmPassword') ? '1px solid #ef4444' : '1px solid #d1d5db' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {hasFieldError('confirmPassword') && (
                  <p style={{ color: '#ef4444' }} className="text-sm mt-1">{getErrorMessage('confirmPassword')}</p>
                )}
              </div>

              {/* Password Requirements */}
              {formData.password && !allRequirementsMet && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-red-800 dark:text-red-300 mb-2">Password Requirements:</p>
                  <ul className="space-y-1 text-sm">
                    <li className={passwordRequirements.minLength ? 'text-gray-600 dark:text-gray-400' : 'text-red-600 dark:text-red-400'}>
                      {passwordRequirements.minLength ? '✓' : '✗'} At least 8 characters
                    </li>
                    <li className={passwordRequirements.hasUpperCase ? 'text-gray-600 dark:text-gray-400' : 'text-red-600 dark:text-red-400'}>
                      {passwordRequirements.hasUpperCase ? '✓' : '✗'} One uppercase letter
                    </li>
                    <li className={passwordRequirements.hasLowerCase ? 'text-gray-600 dark:text-gray-400' : 'text-red-600 dark:text-red-400'}>
                      {passwordRequirements.hasLowerCase ? '✓' : '✗'} One lowercase letter
                    </li>
                    <li className={passwordRequirements.hasNumber ? 'text-gray-600 dark:text-gray-400' : 'text-red-600 dark:text-red-400'}>
                      {passwordRequirements.hasNumber ? '✓' : '✗'} One number
                    </li>
                    <li className={passwordRequirements.hasSpecial ? 'text-gray-600 dark:text-gray-400' : 'text-red-600 dark:text-red-400'}>
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

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400">
                  <CheckCircle size={20} />
                  <span>Account created! Redirecting to login...</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <button
                  onClick={onSwitchToSignIn}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Sign In
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
