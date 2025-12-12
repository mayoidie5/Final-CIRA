import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { UserRole } from '../types';
import { AccountCreatedModal } from './AccountCreatedModal';
import logoNavyBlue from '../../assets/MainLogoNavyBlue.png';
import logoWhite from '../../assets/MainLogoWhite.png';

const errorFieldStyle = `
  input:focus,
  select:focus {
    outline: none;
  }
`;

interface SignUpProps {
  onSwitchToSignIn: () => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onSwitchToSignIn }) => {
  const { signup } = useAuth();
  const { theme, setTheme } = useTheme();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'student' as UserRole,
    studentId: '',
    course: '',
    section: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAccountCreatedModal, setShowAccountCreatedModal] = useState(false);
  const [createdEmail, setCreatedEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    studentId?: string;
    course?: string;
    section?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const isDark = theme === 'dark';

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

  const validateFirstName = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'First name is required';
    }
    return undefined;
  };

  const validateLastName = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'Last name is required';
    }
    return undefined;
  };

  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'Email is required';
    }
    // Accept email with or without @plv.edu.ph since it's added on blur
    const emailWithDomain = value.includes('@plv.edu.ph') ? value : `${value}@plv.edu.ph`;
    if (!emailWithDomain.includes('@plv.edu.ph')) {
      return 'Email must be from @plv.edu.ph domain';
    }
    return undefined;
  };

  const validateRole = (value: string): string | undefined => {
    if (!value) {
      return 'Role is required';
    }
    return undefined;
  };

  const validateCourse = (value: string): string | undefined => {
    if (!value) {
      return 'Course is required';
    }
    return undefined;
  };

  const validateStudentId = (value: string): string | undefined => {
    if (!value) {
      return 'Student ID is required';
    }
    if (!/^\d{2}-\d{4}$/.test(value)) {
      return 'Student ID must be in format XX-XXXX (e.g., 23-3302)';
    }
    return undefined;
  };

  const validateYearSection = (value: string): string | undefined => {
    if (!value) {
      return 'Year-Section is required';
    }
    if (!/^\d{1}-\d{1,2}$/.test(value)) {
      return 'Year-Section must be in format X-X or X-XX (e.g., 2-4 or 2-11)';
    }
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) {
      return 'Password is required';
    }
    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(value)) {
      return 'Password must contain uppercase letter';
    }
    if (!/[a-z]/.test(value)) {
      return 'Password must contain lowercase letter';
    }
    if (!/[0-9]/.test(value)) {
      return 'Password must contain number';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      return 'Password must contain special character';
    }
    return undefined;
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string | undefined => {
    if (!confirmPassword) {
      return 'Confirm password is required';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate all fields
    const errors = {
      firstName: validateFirstName(formData.firstName),
      lastName: validateLastName(formData.lastName),
      email: validateEmail(formData.email),
      role: validateRole(formData.role),
      studentId: validateStudentId(formData.studentId),
      course: validateCourse(formData.course),
      section: validateYearSection(formData.section),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword),
    };

    setFieldErrors(errors);

    // Check if there are any validation errors
    const hasErrors = Object.values(errors).some(error => error !== undefined);
    if (hasErrors) {
      return;
    }

    setLoading(true);

    // Auto-append @plv.edu.ph to email if not already present
    const emailToSubmit = formData.email.includes('@') ? formData.email : `${formData.email}@plv.edu.ph`;
    const submitData = { ...formData, email: emailToSubmit };

    const result = await signup(submitData);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setCreatedEmail(emailToSubmit);
      setShowAccountCreatedModal(true);
      // Reset form
      setTimeout(() => {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          role: 'student' as UserRole,
          studentId: '',
          course: '',
          section: '',
          password: '',
          confirmPassword: '',
        });
        setFieldErrors({});
      }, 500);
    } else {
      setError(result.error || 'Sign up failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Validate instantly based on field name
    let error: string | undefined;
    
    switch (name) {
      case 'firstName':
        error = validateFirstName(value);
        break;
      case 'lastName':
        error = validateLastName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'role':
        error = validateRole(value);
        break;
      case 'course':
        error = validateCourse(value);
        break;
      case 'password':
        error = validatePassword(value);
        // Also validate confirmPassword if it exists
        if (formData.confirmPassword) {
          setFieldErrors(prev => ({
            ...prev,
            password: error,
            confirmPassword: validateConfirmPassword(value, formData.confirmPassword)
          }));
          return;
        }
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(formData.password, value);
        break;
    }

    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.trim();
    
    // Remove @plv.edu.ph if it exists to prevent duplication
    if (value.endsWith('@plv.edu.ph')) {
      value = value.replace('@plv.edu.ph', '');
    }
    
    setFormData(prev => ({ ...prev, email: value }));
  };

  const handleEmailBlur = () => {
    if (formData.email && !formData.email.includes('@')) {
      setFormData(prev => ({ ...prev, email: `${prev.email}@plv.edu.ph` }));
    }
  };

  const handleFieldBlur = (fieldName: keyof typeof formData) => {
    let error: string | undefined;

    switch (fieldName) {
      case 'firstName':
        error = validateFirstName(formData.firstName);
        break;
      case 'lastName':
        error = validateLastName(formData.lastName);
        break;
      case 'email':
        error = validateEmail(formData.email);
        break;
      case 'role':
        error = validateRole(formData.role);
        break;
      case 'studentId':
        error = validateStudentId(formData.studentId);
        break;
      case 'course':
        error = validateCourse(formData.course);
        break;
      case 'section':
        error = validateYearSection(formData.section);
        break;
      case 'password':
        error = validatePassword(formData.password);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(formData.password, formData.confirmPassword);
        break;
    }

    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Remove all characters except digits and dashes
    value = value.replace(/[^\d-]/g, '');
    
    // Extract digits
    const digits = value.replace(/\D/g, '');
    
    // Enforce max 6 digits
    if (digits.length > 6) {
      value = value.slice(0, value.length - (digits.length - 6));
    }
    
    // Find dash position
    const dashIndex = value.indexOf('-');
    
    // If dash exists, enforce exactly 2 digits before and max 4 after
    if (dashIndex !== -1) {
      const beforeDash = value.slice(0, dashIndex).replace(/\D/g, '');
      const afterDash = value.slice(dashIndex + 1).replace(/\D/g, '');
      
      // Enforce 2 digits before dash, 4 digits after
      const finalBeforeDash = beforeDash.slice(0, 2);
      const finalAfterDash = afterDash.slice(0, 4);
      
      // Only show dash if we have digits
      if (finalBeforeDash.length === 2) {
        value = finalBeforeDash + '-' + finalAfterDash;
      } else {
        value = finalBeforeDash + finalAfterDash;
      }
    } else {
      // No dash yet - auto-add after 2 digits
      if (digits.length > 2) {
        value = digits.slice(0, 2) + '-' + digits.slice(2);
      }
    }
    
    setFormData(prev => ({ ...prev, studentId: value }));
    
    // Validate instantly
    const error = validateStudentId(value);
    setFieldErrors(prev => ({
      ...prev,
      studentId: error
    }));
  };

  const handleYearSectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Remove all characters except digits and dashes
    value = value.replace(/[^\d-]/g, '');
    
    // Extract digits
    const digits = value.replace(/\D/g, '');
    
    // Enforce max 3 digits total
    if (digits.length > 3) {
      value = value.slice(0, value.length - (digits.length - 3));
    }
    
    // Find dash position
    const dashIndex = value.indexOf('-');
    
    // If dash exists, enforce exactly 1 digit before and max 2 after
    if (dashIndex !== -1) {
      const beforeDash = value.slice(0, dashIndex).replace(/\D/g, '');
      const afterDash = value.slice(dashIndex + 1).replace(/\D/g, '');
      
      // Enforce 1 digit before dash, max 2 after
      const finalBeforeDash = beforeDash.slice(0, 1);
      const finalAfterDash = afterDash.slice(0, 2);
      
      // Only show dash if we have 1 digit before
      if (finalBeforeDash.length === 1) {
        value = finalBeforeDash + '-' + finalAfterDash;
      } else {
        value = finalBeforeDash + finalAfterDash;
      }
    } else {
      // No dash yet - auto-add after 1 digit
      if (digits.length > 1) {
        value = digits.slice(0, 1) + '-' + digits.slice(1);
      }
    }
    
    setFormData(prev => ({ ...prev, section: value }));
    
    // Validate instantly
    const error = validateYearSection(value);
    setFieldErrors(prev => ({
      ...prev,
      section: error
    }));
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
              style={{ height: '64px' }}
            />
            <h1 className="text-blue-600 dark:text-blue-400 text-xl sm:text-2xl">Comlab Issue Reporting Application</h1>
          </div>

          {/* Horizontal Line */}
          <hr className="my-8 border-gray-300 dark:border-gray-600" />

          {/* Section 2: Sign Up Form */}
          <div className="mb-8 pb-8 border-b-2 border-gray-300 dark:border-gray-600">
            {/* Form Section */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4" style={{ marginTop: '2rem' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={() => handleFieldBlur('firstName')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 dark:bg-gray-700"
                  style={{
                    borderColor: fieldErrors.firstName ? '#dc2626 !important' : undefined,
                    boxShadow: fieldErrors.firstName ? '0 0 0 2px rgba(220, 38, 38, 0.2)' : undefined,
                    color: fieldErrors.firstName ? '#dc2626' : undefined,
                    outline: 'none',
                  }}
                  required
                />
                {fieldErrors.firstName && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={() => handleFieldBlur('lastName')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 dark:bg-gray-700"
                  style={{
                    borderColor: fieldErrors.lastName ? '#dc2626 !important' : undefined,
                    boxShadow: fieldErrors.lastName ? '0 0 0 2px rgba(220, 38, 38, 0.2)' : undefined,
                    color: fieldErrors.lastName ? '#dc2626' : undefined,
                    outline: 'none',
                  }}
                  required
                />
                {fieldErrors.lastName && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.lastName}</p>
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
                  onBlur={() => {
                    handleEmailBlur();
                    handleFieldBlur('email');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 dark:bg-gray-700"
                  placeholder="your.name"
                  style={{
                    borderColor: fieldErrors.email ? '#dc2626 !important' : undefined,
                    boxShadow: fieldErrors.email ? '0 0 0 2px rgba(220, 38, 38, 0.2)' : undefined,
                    color: fieldErrors.email ? '#dc2626' : undefined,
                    outline: 'none',
                  }}
                  autoComplete="email"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                  @plv.edu.ph
                </span>
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                onBlur={() => handleFieldBlur('role')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 dark:bg-gray-700"
                style={{
                  borderColor: fieldErrors.role ? '#dc2626 !important' : undefined,
                  boxShadow: fieldErrors.role ? '0 0 0 2px rgba(220, 38, 38, 0.2)' : undefined,
                  color: fieldErrors.role ? '#dc2626' : undefined,
                  outline: 'none',
                }}
                required
              >
                <option value="">Select Role</option>
                <option value="student">Student</option>
                <option value="class_rep">Class Representative</option>
              </select>
              {fieldErrors.role && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.role}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Student ID (Format: XX-XXXX)</label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleStudentIdChange}
                onBlur={() => handleFieldBlur('studentId')}
                placeholder="23-3302"
                maxLength="7"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 dark:bg-gray-700"
                style={{
                  borderColor: fieldErrors.studentId ? '#dc2626 !important' : undefined,
                  boxShadow: fieldErrors.studentId ? '0 0 0 2px rgba(220, 38, 38, 0.2)' : undefined,
                  color: fieldErrors.studentId ? '#dc2626' : undefined,
                  outline: 'none',
                }}
                required
              />
              {fieldErrors.studentId && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.studentId}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 h-5">Course</label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  onBlur={() => handleFieldBlur('course')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 dark:bg-gray-700"
                  style={{
                    borderColor: fieldErrors.course ? '#dc2626 !important' : undefined,
                    boxShadow: fieldErrors.course ? '0 0 0 2px rgba(220, 38, 38, 0.2)' : undefined,
                    color: fieldErrors.course ? '#dc2626' : undefined,
                    outline: 'none',
                  }}
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
                {fieldErrors.course && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.course}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 h-5">Year-Section <span className="text-xs text-gray-500">(2-4)</span></label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleYearSectionChange}
                  onBlur={() => handleFieldBlur('section')}
                  placeholder="2-4"
                  maxLength="4"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 dark:bg-gray-700"
                  style={{
                    borderColor: fieldErrors.section ? '#dc2626 !important' : undefined,
                    boxShadow: fieldErrors.section ? '0 0 0 2px rgba(220, 38, 38, 0.2)' : undefined,
                    color: fieldErrors.section ? '#dc2626' : undefined,
                    outline: 'none',
                  }}
                  required
                />
                {fieldErrors.section && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.section}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleFieldBlur('password')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 dark:bg-gray-700 pr-10"
                  style={{
                    borderColor: fieldErrors.lastName ? '#dc2626 !important' : undefined,
                    boxShadow: fieldErrors.lastName ? '0 0 0 2px rgba(220, 38, 38, 0.2)' : undefined,
                    color: fieldErrors.lastName ? '#dc2626' : undefined,
                    outline: 'none',
                  }}
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
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.password}</p>
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
                  onBlur={() => handleFieldBlur('confirmPassword')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 dark:bg-gray-700 pr-10"
                  style={{
                    borderColor: fieldErrors.confirmPassword ? '#dc2626 !important' : undefined,
                    boxShadow: fieldErrors.confirmPassword ? '0 0 0 2px rgba(220, 38, 38, 0.2)' : undefined,
                    color: fieldErrors.confirmPassword ? '#dc2626' : undefined,
                    outline: 'none',
                  }}
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
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.confirmPassword}</p>
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

          {/* Sign Up Toggle */}
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

          {/* Horizontal Line */}
          <hr className="my-8 border-gray-300 dark:border-gray-600" />

          {/* Section 3: Footer */}
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">College of Engineering Information Technology</p>
          </div>
        </div>
      </div>

      <AccountCreatedModal
        isOpen={showAccountCreatedModal}
        email={createdEmail}
        onClose={() => {
          setShowAccountCreatedModal(false);
          onSwitchToSignIn();
        }}
      />
    </div>
  );
};
