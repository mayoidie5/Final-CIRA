import emailjs from '@emailjs/browser';
import { db } from '../config/firebase';
import { doc, setDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

// Initialize EmailJS with your public key
// Public Key from EmailJS dashboard
emailjs.init('vB_BtfXpeZnJPBXiw');

// IMPORTANT: These must be replaced with your actual IDs from EmailJS dashboard
// SERVICE_ID format: service_xxxxx (from Email Services page)
// TEMPLATE_ID format: template_xxxxx (from Email Templates page)
const SERVICE_ID = 'service_verifEmail'; // TODO: Replace with your actual Service ID
const VERIFICATION_TEMPLATE_ID = 'template_q4qo4fo'; // TODO: Replace with your actual Template ID

console.log('📧 EmailJS Configuration:');
console.log('  Public Key: vB_BtfXpeZnJPBXiw');
console.log('  Service ID:', SERVICE_ID);
console.log('  Template ID:', VERIFICATION_TEMPLATE_ID);

export const sendVerificationEmail = async (email: string) => {
  try {
    console.log('📧 Attempting to send verification email to:', email);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    console.log('📧 Generated new verification token:', verificationToken);
    
    // Store token in Firestore (server-side) so it persists across devices/sessions
    try {
      const verificationTokensRef = collection(db, 'verificationTokens');
      await setDoc(doc(verificationTokensRef, email), {
        token: verificationToken,
        email: email,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      });
      console.log('💾 Token stored in Firestore for email:', email);
    } catch (firestoreError) {
      console.warn('⚠️ Could not store token in Firestore, falling back to localStorage:', firestoreError);
      // Fallback to localStorage
      const tokens = JSON.parse(localStorage.getItem('verificationTokens') || '{}');
      tokens[email] = {
        token: verificationToken,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
      localStorage.setItem('verificationTokens', JSON.stringify(tokens));
    }
    
    const verificationLink = `${window.location.origin}/verify?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    // Template parameters - must match EXACTLY with variables in your EmailJS template
    // to_email is typically used as the recipient address
    const templateParams = {
      to_email: email,
      user_email: email,
      app_name: 'Comlab Issue Reporting Application',
      verification_link: verificationLink,
    };

    console.log('📧 Verification link:', verificationLink);
    console.log('📧 Template params:', templateParams);

    // Send email using EmailJS
    const response = await emailjs.send(SERVICE_ID, VERIFICATION_TEMPLATE_ID, templateParams);
    
    console.log('✅ Verification email sent successfully!');
    console.log('   Response:', response);

    return { success: true };
  } catch (error: any) {
    console.error('❌ Error sending verification email:');
    console.error('   Status:', error.status);
    console.error('   Text:', error.text);
    console.error('   Full Error:', error);

    // 422 error means template parameters don't match
    if (error.status === 422) {
      console.error('   ⚠️ ERROR 422: Template parameter mismatch!');
      console.error('   → Check your EmailJS template variables');
      console.error('   → Template must contain: {{to_email}}, {{verification_link}}, or similar');
      console.error('   → Variable names are CASE SENSITIVE');
    } else if (error.status === 401) {
      console.error('   ⚠️ ERROR 401: Authentication failed');
      console.error('   → Check your Public Key in emailService.ts');
    } else if (error.status === 404) {
      console.error('   ⚠️ ERROR 404: Service or Template not found');
      console.error('   → Verify SERVICE_ID:', SERVICE_ID);
      console.error('   → Verify TEMPLATE_ID:', VERIFICATION_TEMPLATE_ID);
    }

    throw error;
  }
};

export const generateVerificationToken = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const verifyEmail = async (email: string, token: string): Promise<boolean> => {
  console.log('🔐 Verifying email:', email);
  console.log('🔐 Token to verify:', token);
  
  try {
    // Try to get token from Firestore first
    try {
      const verificationTokensRef = collection(db, 'verificationTokens');
      const q = query(verificationTokensRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const storedToken = querySnapshot.docs[0].data();
        console.log('📦 Found token in Firestore for email:', email);
        
        console.log('📝 Comparing tokens:');
        console.log('   Stored:', storedToken.token);
        console.log('   Received:', token);
        console.log('   Match:', storedToken.token === token);

        if (storedToken.token !== token) {
          console.error('❌ Token mismatch!');
          return false;
        }

        // Check if token has expired
        const expiresAt = new Date(storedToken.expiresAt);
        if (new Date() > expiresAt) {
          console.error('❌ Token expired at:', expiresAt);
          return false;
        }

        // Token is valid! Mark user as verified in Firestore
        try {
          const usersRef = collection(db, 'users');
          const userQuery = query(usersRef, where('email', '==', email));
          const userSnapshot = await getDocs(userQuery);
          
          if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            await updateDoc(doc(db, 'users', userDoc.id), {
              isVerified: true,
            });
            console.log('✅ Firestore updated: User marked as verified for', email);
          }
        } catch (firestoreError: any) {
          console.warn('⚠️ Could not update Firestore:', firestoreError.message);
        }

        // Mark token as used
        try {
          const delQuery = query(verificationTokensRef, where('email', '==', email));
          const delSnapshot = await getDocs(delQuery);
          if (!delSnapshot.empty) {
            await updateDoc(doc(db, 'verificationTokens', delSnapshot.docs[0].id), {
              isUsed: true
            });
          }
        } catch (e) {
          console.warn('Could not mark token as used in Firestore');
        }

        return true;
      }
    } catch (firestoreError: any) {
      console.warn('⚠️ Firestore error, falling back to localStorage:', firestoreError.message);
    }

    // Fallback to localStorage
    const tokens = JSON.parse(localStorage.getItem('verificationTokens') || '{}');
    const storedToken = tokens[email];
    
    if (!storedToken) {
      console.error('❌ No token found for email:', email);
      console.error('   Available emails in tokens:', Object.keys(tokens));
      return false;
    }

    console.log('📝 Comparing tokens (localStorage):');
    console.log('   Stored:', storedToken.token);
    console.log('   Received:', token);
    console.log('   Match:', storedToken.token === token);

    if (storedToken.token !== token) {
      console.error('❌ Token mismatch!');
      return false;
    }

    // Check if token has expired
    const expiresAt = new Date(storedToken.expiresAt);
    if (new Date() > expiresAt) {
      console.error('❌ Token expired at:', expiresAt);
      delete tokens[email];
      localStorage.setItem('verificationTokens', JSON.stringify(tokens));
      return false;
    }

    // Token is valid! Update localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: any) => u.email === email);
    if (userIndex !== -1) {
      users[userIndex].isVerified = true;
      localStorage.setItem('users', JSON.stringify(users));
      console.log('✅ User marked as verified in localStorage');
    }

    // Remove token
    delete tokens[email];
    localStorage.setItem('verificationTokens', JSON.stringify(tokens));
    console.log('✅ Token removed after verification');

    return true;
  } catch (error: any) {
    console.error('❌ Error during email verification:', error);
    return false;
  }
};
