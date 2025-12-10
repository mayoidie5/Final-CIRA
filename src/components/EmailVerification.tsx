import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { verifyEmail } from '../utils/emailService';
import { db } from '../config/firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmailVerificationModal({ isOpen, onClose }: EmailVerificationModalProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const verifyEmailToken = async () => {
      // Get token and email from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const email = urlParams.get('email');

      console.log('📧 URL Parameters:');
      console.log('   Full URL:', window.location.href);
      console.log('   Token from URL:', token);
      console.log('   Email from URL:', email);

      if (!token || !email) {
        setStatus('error');
        setMessage('Invalid verification link. Missing token or email.');
        console.error('❌ Missing token or email in URL');
        return;
      }

      try {
        console.log('🔐 Verifying email:', email);
        const result = await verifyEmail(email, token);

        if (result) {
          setStatus('success');
          setMessage('Your email has been verified successfully! You can now close this window and sign in.');
          console.log('✅ Email verified:', email);
          
          // Update Firestore to mark email as verified (if not already done)
          // This is handled in the verifyEmail function, but we try here as backup
          try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', email));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              const userDoc = querySnapshot.docs[0];
              const userRef = doc(db, 'users', userDoc.id);
              await updateDoc(userRef, { isVerified: true });
              console.log('✅ Firestore confirmed: Email verified for', email);
            }
          } catch (firestoreError: any) {
            console.warn('⚠️ Firestore confirmation error (email may still be verified):', firestoreError.message);
          }
        } else {
          setStatus('error');
          setMessage('Email verification failed. Token may have expired or is invalid.');
          console.log('❌ Verification failed: Invalid or expired token');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'An error occurred during verification. Please try again.');
        console.error('❌ Verification error:', error);
      }
    };

    verifyEmailToken();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-8 text-center">
        {/* Loading State */}
        {status === 'loading' && (
          <>
            <div className="flex justify-center mb-6">
              <Loader className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verifying Email
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we verify your email address...
            </p>
          </>
        )}

        {/* Success State */}
        {status === 'success' && (
          <>
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Email Verified!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>
            <button
              onClick={() => {
                // Close modal and redirect to sign in
                window.history.replaceState({}, document.title, window.location.pathname);
                onClose();
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              Go to Sign In
            </button>
          </>
        )}

        {/* Error State */}
        {status === 'error' && (
          <>
            <div className="flex justify-center mb-6">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>
            <button
              onClick={onClose}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
