import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { UserRole } from '../types';
import logoNavyBlue from '../../assets/MainLogoNavyBlue.png';
import logoWhite from '../../assets/MainLogoWhite.png';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    // Auto-append @plv.edu.ph to email if not already present
    const emailToSubmit = formData.email.includes('@') ? formData.email : `${formData.email}@plv.edu.ph`;
    const submitData = { ...formData, email: emailToSubmit };

    const result = await signup(submitData);
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
            <form onSubmit={handleSubmit} className="space-y-4" style={{ marginTop: '2rem' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
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
                  onBlur={handleEmailBlur}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="your.name"
                  required
                  autoComplete="email"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                  @plv.edu.ph
                </span>
              </div>
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
                placeholder="23-3302"
                maxLength="7"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Course</label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Year-Section (Format: 2-4)</label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleYearSectionChange}
                  placeholder="2-4"
                  maxLength="4"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white pr-10"
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

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white pr-10"
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
    </div>
  );
};
