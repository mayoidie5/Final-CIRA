import { useEffect } from 'react';
import { auth } from '../config/firebase';
import { applyActionCode, isSignInWithEmailLink } from 'firebase/auth';

/**
 * Hook to detect and handle Firebase email verification links
 * Firebase adds ?mode=verifyEmail&oobCode=... to the URL when user clicks the link
 */
export const useVerificationLink = (onVerified?: () => void) => {
  useEffect(() => {
    const handleVerificationLink = async () => {
      try {
        const url = new URL(window.location.href);
        const mode = url.searchParams.get('mode');
        const oobCode = url.searchParams.get('oobCode');
        
        // Check if this is a verification email link from Firebase
        if (mode === 'verifyEmail' && oobCode) {
          console.log('🔗 Detected Firebase verification email link');
          console.log('   Mode:', mode);
          console.log('   Code:', oobCode.substring(0, 10) + '...');
          
          try {
            // Apply the verification code - this marks the email as verified in Firebase Auth
            await applyActionCode(auth, oobCode);
            console.log('✅ Email verified successfully via Firebase');
            
            // Refresh the user's ID token to get updated claims
            const user = auth.currentUser;
            if (user) {
              await user.reload();
              console.log('🔄 User reloaded with verified status');
              console.log('   Email verified:', user.emailVerified);
            }
            
            // Call the callback if provided
            if (onVerified) {
              onVerified();
            }
            
            // Clean up the URL - remove query parameters
            // Use replaceState to avoid adding to history
            window.history.replaceState({}, document.title, window.location.pathname);
            console.log('🧹 Cleaned up URL from query parameters');
            
          } catch (error: any) {
            console.error('❌ Failed to apply verification code:', error);
            if (error.code === 'auth/invalid-action-code') {
              console.error('   Error: Invalid or expired verification code');
            } else if (error.code === 'auth/expired-action-code') {
              console.error('   Error: Verification code has expired');
            }
          }
        } else if (mode === 'resetPassword') {
          // Handle password reset links (not needed now but good to know)
          console.log('🔗 Detected Firebase password reset link');
        }
      } catch (error) {
        console.error('❌ Error checking verification link:', error);
      }
    };

    handleVerificationLink();
  }, [onVerified]);
};
