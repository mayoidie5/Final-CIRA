import emailjs from '@emailjs/browser';
import { db } from '../config/firebase';
import { doc, setDoc, collection, query, where, getDocs, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

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

// Save the network IP/hostname for cross-device verification
const saveNetworkAddress = () => {
  const hostname = window.location.hostname;
  const port = window.location.port || '3000';
  
  // Always save the current access address
  localStorage.setItem('networkIP', hostname);
  localStorage.setItem('networkPort', port);
  console.log('💾 Saved current access address:', hostname + ':' + port);
};

// Call this on module load
saveNetworkAddress();

export const sendVerificationEmail = async (email: string) => {
  try {
    console.log('📧 Attempting to send verification email to:', email);
    
    // Save the current access address FIRST
    const hostname = window.location.hostname;
    const port = window.location.port || '3000';
    localStorage.setItem('networkIP', hostname);
    localStorage.setItem('networkPort', port);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    console.log('📧 Generated new verification token:', verificationToken);
    
    // Store token in Firestore using email as the document ID (simple and direct)
    const tokenDocRef = doc(db, 'verificationTokens', email.toLowerCase());
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    try {
      console.log('💾 Attempting to store token in Firestore...');
      await setDoc(tokenDocRef, {
        token: verificationToken,
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt,
      });
      console.log('💾 Token stored in Firestore');
      console.log('   Email (doc ID):', email.toLowerCase());
      console.log('   Token:', verificationToken);
      console.log('   Expires at:', expiresAt);
    } catch (firestoreError: any) {
      console.error('❌ Failed to store token in Firestore:', firestoreError);
      console.error('   Error code:', firestoreError.code);
      console.error('   Error message:', firestoreError.message);
      throw firestoreError;
    }
    
    // Build verification link using path-based URL (most reliable for email clients)
    // Format: /verify/token/email - this survives email client link rewriting better than query params or hashes
    // Use https:// for production, http:// for localhost development
    const protocol = hostname === 'localhost' ? 'http' : 'https';
    const verificationLink = `${protocol}://${hostname}${port !== '80' && port !== '443' ? ':' + port : ''}/verify/${encodeURIComponent(verificationToken)}/${encodeURIComponent(email.toLowerCase())}`;

    // Template parameters
    const templateParams = {
      to_email: email,
      user_email: email,
      app_name: 'Comlab Issue Reporting Application',
      verification_link: verificationLink,
    };

    console.log('📧 Verification link:', verificationLink);

    // Send email using EmailJS
    const response = await emailjs.send(SERVICE_ID, VERIFICATION_TEMPLATE_ID, templateParams);
    
    console.log('✅ Verification email sent successfully!');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error sending verification email:', error);
    throw error;
  }
};

export const generateVerificationToken = (): string => {
  // Use unambiguous characters only (exclude I, l, O, 0, 1 to prevent confusion)
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

export const verifyEmail = async (email: string, token: string): Promise<boolean> => {
  // Normalize email: trim and lowercase
  email = email.trim().toLowerCase();
  token = token.trim();
  
  console.log('🔐 Starting verification');
  console.log('   Email (normalized):', JSON.stringify(email));
  console.log('   Token:', JSON.stringify(token));
  
  try {
    // Step 1: Get token from Firestore
    console.log('📖 Reading from Firestore...');
    const tokenDocRef = doc(db, 'verificationTokens', email);
    console.log('   Doc ref created for email:', email);
    
    let tokenSnap;
    try {
      tokenSnap = await getDoc(tokenDocRef);
      console.log('   ✅ Firestore read successful');
      console.log('   Document exists:', tokenSnap.exists());
    } catch (firebaseError: any) {
      console.error('❌ Firestore read failed');
      console.error('   Error:', firebaseError);
      console.error('   Error code:', firebaseError.code);
      console.error('   Error message:', firebaseError.message);
      throw firebaseError;
    }
    
    if (!tokenSnap.exists()) {
      console.error('❌ Document not found in Firestore');
      console.error('   Searched for email as doc ID:', email);
      
      // Debug: list all documents
      console.log('📋 Listing all documents in verificationTokens collection:');
      const allDocs = await getDocs(collection(db, 'verificationTokens'));
      console.log(`   Total documents: ${allDocs.size}`);
      allDocs.forEach(doc => {
        console.log(`   - ID: ${doc.id}`);
      });
      
      return false;
    }
    
    // Step 2: Get data and compare tokens
    const data = tokenSnap.data();
    console.log('📦 Document data retrieved');
    console.log('   Firestore token:', JSON.stringify(data?.token));
    console.log('   Received token:', JSON.stringify(token));
    console.log('   Token used before:', data?.used || false);
    
    if (!data?.token) {
      console.error('❌ No token field in document');
      return false;
    }
    
    const tokensMatch = data.token === token;
    console.log('   Tokens match:', tokensMatch);
    
    if (!tokensMatch) {
      console.error('❌ Token mismatch');
      console.error('   Expected:', data.token);
      console.error('   Got:', token);
      return false;
    }

    // Step 3: Check expiration
    console.log('⏰ Checking expiration...');
    const expiresAt = new Date(data.expiresAt);
    const now = new Date();
    const isExpired = now > expiresAt;
    
    console.log('   Expires at:', expiresAt.toISOString());
    console.log('   Current time:', now.toISOString());
    console.log('   Is expired:', isExpired);
    
    if (isExpired) {
      console.error('❌ Token has expired');
      try {
        await deleteDoc(tokenDocRef);
        console.log('🗑️  Deleted expired token');
      } catch (e) {
        console.warn('⚠️ Could not delete token:', e);
      }
      return false;
    }

    // Step 4: Mark user as verified
    console.log('✅ Token valid! Marking user as verified...');
    const usersRef = collection(db, 'users');
    
    let userUpdated = false;
    let usersUpdatedCount = 0;
    
    try {
      console.log('   Attempting to find and update all matching users...');
      // Get all users and find ALL with matching email (case-insensitive)
      const allUsersSnapshot = await getDocs(usersRef);
      console.log('   Total users in database:', allUsersSnapshot.size);
      
      for (const userDocSnapshot of allUsersSnapshot.docs) {
        const userData = userDocSnapshot.data();
        if (userData.email && userData.email.toLowerCase() === email) {
          console.log('   Found matching user:', userDocSnapshot.id, '- updating...');
          try {
            await updateDoc(doc(db, 'users', userDocSnapshot.id), {
              isVerified: true,
            });
            console.log('   ✅ User marked as verified in Firestore');
            userUpdated = true;
            usersUpdatedCount++;
            // DON'T break - update ALL matching users
          } catch (updateError: any) {
            console.error('   ❌ Failed to update user:', updateError.message);
          }
        }
      }
      
      console.log('   Total users updated:', usersUpdatedCount);
      if (!userUpdated) {
        console.warn('   ⚠️ No matching user found, but token was valid');
      }
    } catch (queryError: any) {
      console.error('❌ Error accessing users collection:', queryError.message);
      console.warn('⚠️ Proceeding anyway - user may need to refresh after verification');
    }

    // Step 5: Delete or mark token as used
    try {
      // Mark token as used instead of deleting, so users can re-verify if needed
      await updateDoc(tokenDocRef, {
        used: true,
        verifiedAt: new Date().toISOString(),
      });
      console.log('✅ Token marked as used');
    } catch (e) {
      console.warn('⚠️ Could not mark token as used:', e);
    }

    console.log('✅ Verification complete!');
    return true;
    
  } catch (error: any) {
    console.error('❌ Verification error:', error);
    console.error('   Error message:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Full error object:', JSON.stringify(error, null, 2));
    return false;
  }
};
