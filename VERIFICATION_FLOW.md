# Email Verification Flow - Firebase Native Implementation

## Overview
The application now uses Firebase's native email verification system. When a user clicks the verification link in their email, they are redirected back to the same tab they were on, with their email automatically verified.

## Flow Diagram

```
User Signs Up
    ↓
Firebase Auth User Created + Firestore Document Created
    ↓
Firebase Sends Verification Email (with actionable link)
    ↓
User Clicks Link in Email
    ↓
[VERIFICATION LINK HANDLER IN AuthContext]
    ├─ Detects mode=verifyEmail & oobCode parameters
    ├─ Calls applyActionCode() to verify email
    ├─ Firebase Auth marks user.emailVerified = true
    ├─ Cleans up URL (removes query parameters)
    └─ Redirects back to same page/tab
    ↓
User Can Now Login
    ↓
Login checks firebaseUser.emailVerified
    ├─ If true: Login succeeds, syncs isVerified to Firestore
    └─ If false: Shows verification required message
```

## Key Components

### 1. AuthContext Verification Handler
**File:** `src/contexts/AuthContext.tsx`

- Runs on component mount (in a separate useEffect)
- Detects Firebase query parameters: `?mode=verifyEmail&oobCode=...`
- Calls `applyActionCode(auth, oobCode)` to apply the verification
- Cleans up URL using `window.history.replaceState()` to remove query parameters
- Returns user to the same page/tab they were on

```typescript
// In AuthContext useEffect:
if (mode === 'verifyEmail' && oobCode) {
  await applyActionCode(auth, oobCode);
  // Firebase now has emailVerified = true for this user
  window.history.replaceState({}, document.title, window.location.pathname);
}
```

### 2. Login Function Verification Check
**File:** `src/contexts/AuthContext.tsx` - `login()` function

- Checks `firebaseUser.emailVerified` from Firebase Auth (source of truth)
- If not verified, returns `needsVerification: true` error
- If verified, automatically syncs `isVerified` flag to Firestore if needed

```typescript
if (!firebaseUser.emailVerified) {
  return { 
    success: false, 
    needsVerification: true, 
    error: 'Email not verified. Please check your inbox for the verification link.' 
  };
}
```

### 3. Email Service
**File:** `src/utils/emailService.ts`

- `sendVerificationEmail(email)`: Sends Firebase verification email to user
- `markEmailAsVerified(uid)`: Updates Firestore `isVerified` flag after verification

## User Experience

### Happy Path (Verification Success)
1. User signs up with email
2. Receives verification email from Firebase
3. Clicks link → redirected back to app (same tab)
4. URL is cleaned up (no query parameters visible)
5. User logs in and enters the app

### Verification Link Clicked
- URL changes to: `?mode=verifyEmail&oobCode=...`
- Handler silently processes the code
- User sees the page they were on (no modal, no redirect)
- Email is verified in Firebase Auth backend
- On next login, verification succeeds

### Invalid/Expired Link
- Handler attempts to apply code
- Firebase returns error (invalid-action-code or expired-action-code)
- User is informed in console logs
- Can request resend verification email

## URL Cleanup

The verification link handler uses `window.history.replaceState()` to:
- Remove query parameters from the address bar
- Not add an entry to browser history
- Keep the user on the same URL path

This ensures the user sees a clean URL and the browser back/forward buttons work naturally.

## Firebase Admin SDK Configuration

The app uses Firebase Admin SDK for:
- Creating admin accounts programmatically
- Sending verification emails via Firebase's email service

This is more reliable than custom token-based verification, especially in:
- Email clients that modify links
- Vercel deployments with different domain handling
- Cross-tab verification scenarios

## Testing Verification

### Local Testing
1. Sign up with any email
2. Check Firebase Console → Authentication → Users
3. Find the user and note they have `Email Verified: false`
4. Manually change verification status or use auth link
5. Try logging in - should succeed with `emailVerified: true`

### Production Testing
1. Sign up with real email
2. Receive Firebase verification email
3. Click the link
4. Return to app (may redirect or stay on current page)
5. Log in to confirm verification worked

## Security

- Firebase handles all email verification server-side
- Verification codes are one-time use and expire after 24 hours
- No custom tokens stored in localStorage
- Source of truth is Firebase Auth's `emailVerified` property
- Firestore's `isVerified` flag is kept in sync as a secondary record
