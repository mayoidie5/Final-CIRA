import { auth, db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { sendEmailVerification, ActionCodeSettings } from 'firebase/auth';

export const sendVerificationEmail = async (email: string) => {
  try {
    console.log('📧 Attempting to send verification email to:', email);
    
    // Get the current user from Firebase Auth
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No authenticated user found');
    }

    // Get the app URL - use window.location.origin for correct domain
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://cira-six.vercel.app';
    const continueUrl = `${appUrl}/?verifying=true`;
    
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
