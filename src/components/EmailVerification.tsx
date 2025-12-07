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
        const result = verifyEmail(email, token);

        if (result) {
          setStatus('success');
          setMessage('Your email has been verified successfully! You can now close this window and sign in.');
          console.log('✅ Email verified:', email);
          
          // Update Firestore to mark email as verified
          // Try to find and update the user document
          try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', email));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              const userDoc = querySnapshot.docs[0];
              const userRef = doc(db, 'users', userDoc.id);
              await updateDoc(userRef, { isVerified: true });
              console.log('✅ Firestore updated: Email verified for', email);
            } else {
              console.warn('⚠️ Could not find user in Firestore with email:', email);
              console.log('   Will update on next login');
            }
          } catch (firestoreError: any) {
            console.warn('⚠️ Could not update Firestore immediately (this is normal)');
            console.warn('   Error:', firestoreError.message);
            console.log('   Email will be marked verified on next sign in');
            // This is OK - when user signs in, we'll check if email is verified
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
