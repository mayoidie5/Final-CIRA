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

    // Get the app URL based on current location or environment
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://final-cira.vercel.app';
    
    // Configure action code settings for verification email
    const actionCodeSettings: ActionCodeSettings = {
      url: `${appUrl}/?verifying=true`, // Continue URL after verification
      handleCodeInApp: false, // Firebase handles the code, not our app
    };

    // Send Firebase's built-in verification email with settings
    await sendEmailVerification(user, actionCodeSettings);
    console.log('✅ Firebase verification email sent to:', email);
    console.log('   Continue URL:', actionCodeSettings.url);
    
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error sending verification email:', error);
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
