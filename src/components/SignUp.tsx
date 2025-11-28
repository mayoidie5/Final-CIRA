import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle, Moon, Sun, Mail, ArrowRight } from 'lucide-react';
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
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showVerificationRequiredModal, setShowVerificationRequiredModal] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
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

  const isSectionValid = (section: string) => {
    // Valid formats: X-X, X-XX, XX-X, XX-XX
    return /^(\d{1,2}-\d{1,2})$/.test(section);
  };

  const hasFieldError = (fieldName: string): boolean => {
    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        if (formData[fieldName as keyof typeof formData] === '') {
          return !touched[fieldName] ? false : true;
        }
        return false;
      case 'email':
        if (formData.email === '') {
          return !touched[fieldName] ? false : true;
        }
        return !isEmailValid(formData.email);
      case 'studentId':
        if (formData.studentId === '') {
          return !touched[fieldName] ? false : true;
        }
        return !isStudentIdValid(formData.studentId);
      case 'section':
        if (formData.section === '') {
          return !touched[fieldName] ? false : true;
        }
        return !isSectionValid(formData.section);
      case 'course':
      case 'yearLevel':
        if (formData[fieldName as keyof typeof formData] === '') {
          return !touched[fieldName] ? false : true;
        }
        return false;
      case 'password':
        if (formData.password === '') {
          return !touched[fieldName] ? false : true;
        }
        return !allRequirementsMet;
      case 'confirmPassword':
        if (formData.confirmPassword === '') {
          return !touched[fieldName] ? false : true;
        }
        return !passwordsMatch;
      default:
        return false;
    }
  };

  const getErrorMessage = (fieldName: string): string => {
    switch (fieldName) {
      case 'firstName':
        if (!touched[fieldName] && !formData.firstName) return '';
        return !formData.firstName ? 'First name is required' : '';
      case 'lastName':
        if (!touched[fieldName] && !formData.lastName) return '';
        return !formData.lastName ? 'Last name is required' : '';
      case 'email':
        if (!formData.email) return !touched[fieldName] ? '' : 'Email is required';
        if (!isEmailValid(formData.email)) return 'Email must end with @plv.edu.ph';
        return '';
      case 'studentId':
        if (!formData.studentId) return !touched[fieldName] ? '' : 'Student ID is required';
        if (!isStudentIdValid(formData.studentId)) return 'Format must be XX-XXXX (e.g., 23-3302)';
        return '';
      case 'course':
        if (!touched[fieldName] && !formData.course) return '';
        return !formData.course ? 'Course selection is required' : '';
      case 'section':
        if (!formData.section) return !touched[fieldName] ? '' : 'Section is required';
        if (!isSectionValid(formData.section)) return 'Format must be X-XX or XX-XX (e.g., 1-1 or 11-11)';
        return '';
      case 'yearLevel':
        if (!touched[fieldName] && !formData.yearLevel) return '';
        return !formData.yearLevel ? 'Year level selection is required' : '';
      case 'password':
        if (!formData.password) return !touched[fieldName] ? '' : 'Password is required';
        if (!allRequirementsMet) return 'Password does not meet all requirements';
        return '';
      case 'confirmPassword':
        if (!formData.confirmPassword) return !touched[fieldName] ? '' : 'Please confirm your password';
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
      // Show the verification required modal instead of the basic success modal
      setShowVerificationRequiredModal(true);
    } else {
      setError(result.error || 'Sign up failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    // Remove @plv.edu.ph if it exists to avoid duplicates
    input = input.replace(/@plv\.edu\.ph/g, '');
    // Store the full email with domain in formData
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

  const handleSectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    // Remove multiple hyphens, keep only one
    input = input.replace(/-+/g, '-');
    
    // Extract digits and check for hyphen position
    let digits = input.replace(/\D/g, '').slice(0, 4); // up to 4 digits
    let hasHyphen = input.includes('-');
    
    // Format based on what user typed
    let formatted = '';
    
    if (hasHyphen) {
      // User typed with hyphen, preserve the format they intended
      const parts = input.split('-');
      const firstPart = parts[0].replace(/\D/g, '');
      const secondPart = parts[1] ? parts[1].replace(/\D/g, '') : '';
      
      // Keep up to 2 digits in each part
      formatted = firstPart.slice(0, 2);
      if (secondPart || input.endsWith('-')) {
        formatted += '-' + secondPart.slice(0, 2);
      }
    } else {
      // User typed without hyphen
      if (digits.length === 1) {
        formatted = digits;
      } else if (digits.length === 2) {
        formatted = digits;
      } else if (digits.length === 3) {
        formatted = digits.slice(0, 2) + '-' + digits.slice(2, 3);
      } else if (digits.length === 4) {
        formatted = digits.slice(0, 2) + '-' + digits.slice(2, 4);
      }
    }
    
    setFormData(prev => ({ ...prev, section: formatted }));
    
    // Set cursor position after the last character
    setTimeout(() => {
      const sectionInput = e.target as HTMLInputElement;
      sectionInput.setSelectionRange(formatted.length, formatted.length);
    }, 0);
  };

  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    // Remove any non-digit characters
    input = input.replace(/\D/g, '');
    // Limit to 6 digits total (XX-XXXX format)
    input = input.slice(0, 6);
    
    // Format as XX-XXXX
    let formatted = '';
    if (input.length > 0) {
      formatted = input.slice(0, 2);
      if (input.length > 2) {
        formatted += '-' + input.slice(2, 6);
      }
    }
    
    setFormData(prev => ({ ...prev, studentId: formatted }));
    
    // Set cursor position after the last character
    setTimeout(() => {
      const studentIdInput = e.target as HTMLInputElement;
      studentIdInput.setSelectionRange(formatted.length, formatted.length);
    }, 0);
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    // Just close modal - don't redirect
    setResendLoading(false);
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
                <div className="relative">
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleEmailChange}
                    onBlur={handleFieldBlur}
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
                  onChange={handleStudentIdChange}
                  onBlur={handleFieldBlur}
                  placeholder="23-3302"
                  className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  style={{ border: hasFieldError('studentId') ? '1px solid #ef4444' : '1px solid #d1d5db' }}
                  maxLength={7}
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
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Section (Format: XX-XX)</label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleSectionChange}
                  onBlur={handleFieldBlur}
                  placeholder="1-1"
                  className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  style={{ border: hasFieldError('section') ? '1px solid #ef4444' : '1px solid #d1d5db' }}
                  maxLength={5}
                  required
                />
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

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-300">Account Created Successfully!</h3>
                      <p className="text-sm text-green-800 dark:text-green-400">
                        We've sent a verification email to <strong>{formData.email}</strong>
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-500 ml-9">
                    Please verify your email before signing in.
                  </p>
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
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                  disabled
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

      {/* Email Verification Required Modal */}
      {showVerificationRequiredModal && (
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
                  onClick={() => {
                    setShowVerificationRequiredModal(false);
                    onSwitchToSignIn();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Got it, I'll verify my email
                  <CheckCircle size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
