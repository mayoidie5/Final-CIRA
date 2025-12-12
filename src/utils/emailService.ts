import { auth, db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { sendEmailVerification, ActionCodeSettings, sendPasswordResetEmail } from 'firebase/auth';

// ============================================
// FIREBASE ACTION URL CONFIGURATION
// ============================================
// Customize these URLs based on your deployment environment
// These URLs are used in Firebase verification and password reset emails

const getAppUrl = (): string => {
  if (typeof window === 'undefined') {
    return 'https://cira-six.vercel.app';
  }
  return window.location.origin;
};

// Configuration for action code URLs
export const firebaseActionUrls = {
  // Email verification: User clicks link in email → redirected to this URL
  // The app detects the code type and handles accordingly
  emailVerification: (appUrl: string) => `${appUrl}/resend-email-verification`,
  
  // Password reset: User clicks link in email → redirected to this URL with oobCode
  // The app detects the code type and handles accordingly
  passwordReset: (appUrl: string) => `${appUrl}/auth/action`,
  
  // Email change confirmation: User clicks link in email → redirected to this URL
  emailChange: (appUrl: string) => `${appUrl}/resend-email-verification`,
};

// ============================================
// EMAIL VERIFICATION
// ============================================
export const sendVerificationEmail = async (email: string) => {
  try {
    console.log('📧 Attempting to send verification email to:', email);
    
    // Get the current user from Firebase Auth
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No authenticated user found');
    }

    // Get the app URL
    const appUrl = getAppUrl();
    const continueUrl = firebaseActionUrls.emailVerification(appUrl);
    
    console.log('🔗 Continue URL:', continueUrl);
    console.log('📍 Origin:', appUrl);
    
    // Configure action code settings for verification email
    const actionCodeSettings: ActionCodeSettings = {
      url: continueUrl, // Continue URL after verification - MUST be allowlisted in Firebase Console
      handleCodeInApp: false, // Firebase handles the code, not our app
    };

    // Send Firebase's built-in verification email with settings
    await sendEmailVerification(user, actionCodeSettings);
    console.log('✅ Firebase verification email sent to:', email);
    
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error sending verification email:', error);
    
    // Provide helpful error messages
    if (error.code === 'auth/unauthorized-continue-uri') {
      console.error('   ⚠️ ERROR: Domain not allowlisted in Firebase Console');
      console.error('   👉 Go to Firebase Console → Authentication → Settings');
      console.error('   👉 Add the continue URL to "Authorized domains"');
      console.error('   👉 Current domain:', typeof window !== 'undefined' ? window.location.origin : 'unknown');
    }
    
    throw error;
  }
};

// ============================================
// PASSWORD RESET WITH CUSTOM ACTION URL
// ============================================
export const sendPasswordResetEmailWithCustomUrl = async (email: string) => {
  try {
    console.log('📧 Attempting to send password reset email to:', email);
    
    // Get the app URL
    const appUrl = getAppUrl();
    const continueUrl = firebaseActionUrls.passwordReset(appUrl);
    
    console.log('🔗 Password Reset Continue URL:', continueUrl);
    console.log('📍 Origin:', appUrl);
    
    // Configure action code settings for password reset email
    const actionCodeSettings: ActionCodeSettings = {
      url: continueUrl, // Continue URL for password reset - MUST be allowlisted in Firebase Console
      handleCodeInApp: false, // Firebase handles the code in the email link
    };

    // Send Firebase password reset email with custom URL
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    console.log('✅ Firebase password reset email sent to:', email);
    
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error sending password reset email:', error);
    
    if (error.code === 'auth/unauthorized-continue-uri') {
      console.error('   ⚠️ ERROR: Domain not allowlisted in Firebase Console');
      console.error('   👉 Go to Firebase Console → Authentication → Settings');
      console.error('   👉 Add the continue URL to "Authorized domains"');
      console.error('   👉 Current domain:', typeof window !== 'undefined' ? window.location.origin : 'unknown');
    }
    
    throw error;
  }
};

export const markEmailAsVerified = async (uid: string) => {
  try {
    console.log('📝 Marking email as verified for user:', uid);
    
    // Update the user document in Firestore
    await updateDoc(doc(db, 'users', uid), {
      isVerified: true,
      verifiedAt: new Date().toISOString(),
    });
    
    console.log('✅ User marked as verified in Firestore');
    return true;
  } catch (error: any) {
    console.error('❌ Error marking email as verified:', error);
    throw error;
  }
};
