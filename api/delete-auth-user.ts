import { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  });
}

const auth = admin.auth();

export default async (req: VercelRequest, res: VercelResponse) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Get user by email and delete
    const user = await auth.getUserByEmail(email);
    await auth.deleteUser(user.uid);

    return res.status(200).json({ success: true, message: `User ${email} deleted from Firebase Auth` });
  } catch (error: any) {
    console.error('Error deleting user from Firebase Auth:', error);

    // If user not found, that's okay - they might not have signed up yet
    if (error.code === 'auth/user-not-found') {
      return res.status(200).json({ success: true, message: 'User not found in Firebase Auth (already deleted or never existed)' });
    }

    return res.status(500).json({ error: error.message || 'Failed to delete user from Firebase Auth' });
  }
};
