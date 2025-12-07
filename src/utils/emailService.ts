import emailjs from '@emailjs/browser';

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

    // Check if token already exists for this email
    const tokens = JSON.parse(localStorage.getItem('verificationTokens') || '{}');
    let verificationToken: string;
    
    if (tokens[email]) {
      // Use existing token
      verificationToken = tokens[email].token;
      console.log('📧 Using existing token for email:', email);
      console.log('📧 Existing token:', verificationToken);
    } else {
      // Generate new token
      verificationToken = generateVerificationToken();
      console.log('📧 Generated new verification token:', verificationToken);
      
      // Store token in localStorage BEFORE sending email
      tokens[email] = {
        token: verificationToken,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      };
      localStorage.setItem('verificationTokens', JSON.stringify(tokens));
      console.log('💾 Token stored in localStorage for email:', email);
      console.log('💾 Stored token value:', verificationToken);
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

export const verifyEmail = (email: string, token: string): boolean => {
  console.log('🔐 Verifying email:', email);
  console.log('🔐 Token to verify:', token);
  
  const tokens = JSON.parse(localStorage.getItem('verificationTokens') || '{}');
  console.log('📦 All stored tokens:', tokens);
  
  const storedToken = tokens[email];
  console.log('🔍 Stored token object for email:', storedToken);

  if (!storedToken) {
    console.error('❌ No token found for email:', email);
    console.error('   Available emails in tokens:', Object.keys(tokens));
    return false;
  }

  console.log('📝 Comparing tokens:');
  console.log('   Stored:', storedToken.token);
  console.log('   Received:', token);
  console.log('   Match:', storedToken.token === token);

  if (storedToken.token !== token) {
    console.error('❌ Token mismatch!');
    console.error('   Expected:', storedToken.token);
    console.error('   Got:', token);
    console.error('   Stored token length:', storedToken.token.length);
    console.error('   Received token length:', token.length);
    return false;
  }

  // Check if token has expired
  const expiresAt = new Date(storedToken.expiresAt);
  console.log('⏰ Token expiration check:');
  console.log('   Expires at:', expiresAt);
  console.log('   Now:', new Date());
  
  if (new Date() > expiresAt) {
    console.error('❌ Token expired at:', expiresAt);
    delete tokens[email];
    localStorage.setItem('verificationTokens', JSON.stringify(tokens));
    return false;
  }

  console.log('✅ Token valid, marking email as verified');

  // Update user as verified
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userIndex = users.findIndex((u: any) => u.email === email);
  
  if (userIndex !== -1) {
    users[userIndex].isVerified = true;
    localStorage.setItem('users', JSON.stringify(users));
    console.log('✅ User marked as verified in localStorage');
  }

  // Remove token after use
  delete tokens[email];
  localStorage.setItem('verificationTokens', JSON.stringify(tokens));
  console.log('✅ Token removed after verification');

  return true;
};
