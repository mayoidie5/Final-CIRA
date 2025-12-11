const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccountKey = require('./firebase-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
  databaseURL: "https://cira-db.firebaseio.com"
});

const db = admin.firestore();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API endpoint for email verification
app.get('/api/verify/:token/:email', async (req, res) => {
  try {
    const { token, email } = req.params;
    const decodedEmail = decodeURIComponent(email);
    const decodedToken = decodeURIComponent(token);

    console.log(`[VERIFY] Attempting to verify: ${decodedEmail}`);
    console.log(`[VERIFY] Token: ${decodedToken}`);

    // Get token from Firestore
    const tokenDocRef = db.collection('verificationTokens').doc(decodedEmail);
    const tokenSnap = await tokenDocRef.get();

    if (!tokenSnap.exists()) {
      console.log(`[VERIFY] Document not found for: ${decodedEmail}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Verification token not found. It may have expired.',
        debug: `No document found for email: ${decodedEmail}`
      });
    }

    const data = tokenSnap.data();
    console.log(`[VERIFY] Found document. Token match: ${data.token === decodedToken}`);

    // Compare tokens
    if (data.token !== decodedToken) {
      console.log(`[VERIFY] Token mismatch. Expected: ${data.token}, Got: ${decodedToken}`);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid verification token.',
        debug: `Token mismatch`
      });
    }

    // Check expiration
    const expiresAt = new Date(data.expiresAt);
    if (new Date() > expiresAt) {
      console.log(`[VERIFY] Token expired at: ${expiresAt}`);
      await tokenDocRef.delete();
      return res.status(400).json({ 
        success: false, 
        message: 'Verification token has expired.',
        debug: `Token expired at: ${expiresAt}`
      });
    }

    // Mark user as verified
    const usersRef = db.collection('users');
    const userSnapshot = await usersRef.where('email', '==', decodedEmail).get();

    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      await userDoc.ref.update({ isVerified: true });
      console.log(`[VERIFY] User marked as verified: ${decodedEmail}`);
    }

    // Delete token
    await tokenDocRef.delete();
    console.log(`[VERIFY] Token deleted for: ${decodedEmail}`);

    res.json({ 
      success: true, 
      message: 'Email verified successfully!' 
    });

  } catch (error) {
    console.error('[VERIFY] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred during verification.',
      error: error.message
    });
  }
});

// Serve static files from build directory
app.use(express.static(path.join(__dirname, 'build')));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📱 Access from network: http://0.0.0.0:${PORT}`);
});
