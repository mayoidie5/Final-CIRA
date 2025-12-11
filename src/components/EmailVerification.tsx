import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { verifyEmail } from '../utils/emailService';
import { auth, db } from '../config/firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmailVerificationModal({ isOpen, onClose }: EmailVerificationModalProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const verifyEmailToken = async () => {
      try {
        // Check network connectivity on mobile
        if (!navigator.onLine) {
          console.error('❌ No internet connection');
          setStatus('error');
          setMessage('No internet connection detected. Please check your connection and try again.');
          return;
        }
        
        console.log('📡 Internet connection: OK');
        
        // Ensure user is authenticated (anonymously if needed)
        console.log('🔐 Checking Firebase auth...');
        console.log('   Device User Agent:', navigator.userAgent);
        
        if (!auth.currentUser) {
          console.log('   No user logged in, signing in anonymously...');
          const result = await signInAnonymously(auth);
          console.log('   ✅ Anonymous sign-in successful:', result.user.uid);
          // Wait longer on mobile for Firebase to fully initialize
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          const waitTime = isMobile ? 2000 : 500;
          console.log('   Waiting', waitTime, 'ms for Firebase to initialize...');
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          console.log('   ✅ User already authenticated:', auth.currentUser.uid);
        }
      } catch (authError) {
        console.error('⚠️ Anonymous auth failed:', authError);
        // Force retry on mobile
        if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
          console.log('   Retrying anonymous auth on mobile...');
          try {
            await signInAnonymously(auth);
            await new Promise(resolve => setTimeout(resolve, 2500));
          } catch (retryError) {
            console.error('⚠️ Retry failed:', retryError);
          }
        }
      }

      // Get token and email from URL
      // Try path-based first: /verify/TOKEN/EMAIL
      const pathname = window.location.pathname;
      const pathParts = pathname.split('/').filter(p => p);
      
      let token = null;
      let email = null;
      
      console.log('🔍 URL Parsing Debug:');
      console.log('   Full URL:', window.location.href);
      console.log('   Pathname:', window.location.pathname);
      console.log('   Search:', window.location.search);
      console.log('   Hash:', window.location.hash);
      console.log('   Path parts:', pathParts);
      console.log('   Path parts length:', pathParts.length);
      
      if (pathParts[0] === 'verify' && pathParts.length >= 3) {
        token = decodeURIComponent(pathParts[1]);
        email = decodeURIComponent(pathParts[2]);
        console.log('📧 Verification link parsed from path');
        console.log('   Token from path:', token);
        console.log('   Email from path:', email);
      } else {
        // Fallback to query/hash params
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        
        token = urlParams.get('token') || hashParams.get('token');
        email = urlParams.get('email') || hashParams.get('email');
        
        if (email) email = decodeURIComponent(email);
        if (token) token = decodeURIComponent(token);
        
        if (token || email) {
          console.log('📧 Verification link parsed from query/hash params');
        }
      }

      const debug = `URL: ${window.location.href}\nPathname: ${window.location.pathname}\nPath Parts: ${JSON.stringify(pathParts)}\nToken: ${token}\nEmail: ${email}`;
      setDebugInfo(debug);

      console.log('📧 URL Parameters:');
      console.log('   Full URL:', window.location.href);
      console.log('   Pathname:', window.location.pathname);
      console.log('   Token:', token);
      console.log('   Email:', email);

      if (!token || !email) {
        setStatus('error');
        setMessage(`Invalid verification link. Missing token or email. Token: ${token ? 'found' : 'missing'}, Email: ${email ? 'found' : 'missing'}`);
        console.error('❌ Missing token or email in URL');
        return;
      }

      try {
        console.log('🔐 Verifying email with Firestore:', email);
        
        // Add retry logic for mobile
        let result = false;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const maxRetries = isMobile ? 3 : 1;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          console.log(`📱 Verification attempt ${attempt}/${maxRetries}`);
          try {
            result = await verifyEmail(email, token);
            if (result) break; // Success, exit retry loop
            
            // If failed, wait before retry on mobile
            if (attempt < maxRetries) {
              console.log('   Retrying in 1.5 seconds...');
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
          } catch (attemptError) {
            console.error(`   Attempt ${attempt} failed:`, attemptError);
            if (attempt < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1500));
            } else {
              throw attemptError;
            }
          }
        }

        if (result) {
          setStatus('success');
          setMessage('Your email has been verified successfully! You can now close this window and sign in.');
          console.log('✅ Email verified:', email);
        } else {
          setStatus('error');
          setMessage('Email verification failed. Token may have expired or is invalid.');
          console.log('❌ Verification failed: Invalid or expired token');
        }
      } catch (error: any) {
        setStatus('error');
        const errorMsg = error.message || 'An error occurred during verification. Please try again.';
        setMessage(errorMsg);
        const errorDetails = `
Error: ${errorMsg}
Error Type: ${error.name || 'Unknown'}
Error Code: ${error.code || 'N/A'}
Stack: ${error.stack || 'N/A'}
Auth User: ${auth.currentUser ? auth.currentUser.uid : 'No user'}
`;
        setDebugInfo(prev => prev + '\n' + errorDetails);
        console.error('❌ Verification error:', error);
        console.error('   Full error details:', errorDetails);
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
            {debugInfo && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4 mb-6 text-left max-h-64 overflow-y-auto">
                <p className="text-xs font-mono text-red-700 dark:text-red-300 whitespace-pre-wrap break-words">
                  {debugInfo}
                </p>
              </div>
            )}
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
