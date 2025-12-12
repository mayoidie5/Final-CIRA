import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Mail, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ResendVerificationModalProps {
  email: string;
  onClose: () => void;
}

export const ResendVerificationModal: React.FC<ResendVerificationModalProps> = ({ email, onClose }) => {
  const { resendVerification } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleResend = async () => {
    setError('');
    setLoading(true);

    try {
      await resendVerification(email);
      setSuccess(true);
      console.log('✅ Verification email resent to:', email);
    } catch (err: any) {
      console.error('❌ Failed to resend verification:', err);
      setError(err.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        {success ? (
          <>
            <div className="flex justify-center mb-4">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Email Sent!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              We've sent a verification link to <strong>{email}</strong>. Please check your inbox and click the link to verify your email.
            </p>
            <button
              onClick={handleClose}
              className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Got it, thanks!
            </button>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <Mail size={48} className="text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Verify Your Email
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-2">
              Your account requires email verification to proceed.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              We'll send a verification link to <strong>{email}</strong>
            </p>

            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleResend}
                disabled={loading}
                className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader size={18} className="animate-spin" />}
                {loading ? 'Sending...' : 'Send Verification Email'}
              </button>
              <button
                onClick={handleClose}
                className="w-full px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
