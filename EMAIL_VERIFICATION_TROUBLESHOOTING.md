## 🔧 Email Verification Troubleshooting Guide

### ❌ Current Issue: No Email Sent When Account Created

The most likely cause is **incorrect SERVICE_ID or TEMPLATE_ID** in `emailService.ts`.

---

## ✅ Step-by-Step Fix

### Step 1: Get Your Correct SERVICE_ID
1. Go to https://dashboard.emailjs.com/
2. Click **Email Services** in the left sidebar
3. You should see your email service (connected to Outlook, Gmail, etc.)
4. Click on the service name to open it
5. Look for **Service ID** - it will look like: `service_xxxxx`
6. Copy this ID

### Step 2: Get Your Correct TEMPLATE_ID
1. In EmailJS dashboard, click **Email Templates**
2. Find your email verification template
3. Click on it to open
4. Look for **Template ID** - it will look like: `template_xxxxx`
5. Copy this ID

### Step 3: Update emailService.ts
Replace these lines in `src/utils/emailService.ts`:

```typescript
const SERVICE_ID = 'service_cira_email'; // ← Replace with your actual Service ID
const VERIFICATION_TEMPLATE_ID = 'template_q4qo4fo'; // ← Replace with your actual Template ID
```

Example (your actual IDs will be different):
```typescript
const SERVICE_ID = 'service_abc123def456'; // Your actual ID
const VERIFICATION_TEMPLATE_ID = 'template_xyz789uvw012'; // Your actual ID
```

### Step 4: Verify Template Variables
In your EmailJS Email Template, make sure you have these variables:
- `{{to_email}}` - The recipient email
- `{{verification_link}}` - The verification URL
- `{{user_email}}` - User's email (for display)
- `{{app_name}}` - Application name

---

## 🧪 Testing & Debugging

### To Test Email Sending:

1. **Save the corrected SERVICE_ID and TEMPLATE_ID**
2. **Create a new test account** with an email like `test@plv.edu.ph`
3. **Open Browser DevTools** (Press F12)
4. **Go to Console tab**
5. **Create the account and watch for messages:**

✅ **Success Messages:**
```
📧 EmailJS Configuration:
  Public Key: vB_BtfXpeZnJPBXiw
  Service ID: service_xxxxx
  Template ID: template_xxxxx

📧 Attempting to send verification email to: test@plv.edu.ph
📧 Template params: {to_email: "test@plv.edu.ph", ...}
✅ Verification email sent successfully!
   Response: {status: 200}
```

❌ **Error Messages & Solutions:**

| Error | Cause | Solution |
|-------|-------|----------|
| `SERVICE_ID = 'service_cira_email'` not working | Wrong Service ID format | Check Email Services page for actual ID |
| `TEMPLATE_ID = 'template_q4qo4fo'` not found | Wrong Template ID | Check Email Templates page for actual ID |
| `auth/invalid-sender-email` | Email service not configured | Go to Email Services and verify setup |
| `CORS error` | EmailJS not initialized properly | Check public key is correct |
| `Template not found` | Wrong template ID or template deleted | Check Email Templates for correct ID |

---

## 📋 Checklist

- [ ] I have copied my actual **Service ID** from EmailJS Email Services page
- [ ] I have copied my actual **Template ID** from EmailJS Email Templates page
- [ ] I have updated both IDs in `src/utils/emailService.ts`
- [ ] I have restarted the development server (`npm run dev`)
- [ ] I created a test account and checked the browser console
- [ ] I can see `✅ Verification email sent successfully!` in the console

---

## 🚀 If Everything is Correct

After fixing the IDs:
1. Users will receive a verification email when they create an account
2. Email will come from your configured email service (Outlook, Gmail, etc.)
3. Verification link will open in the app and mark email as verified
4. User can then log in

---

## 📞 Need Help?

If you're still not receiving emails after following these steps:

1. Check your **Spam/Junk folder** - the email might be filtered
2. Check **EmailJS dashboard** for any send failures:
   - Go to **Dashboard** → **Logs** tab
   - Look for failed email sends with error reasons
3. Verify your **email service is active**:
   - Go to **Email Services**
   - Make sure the service is checked/enabled
4. Check **email template has proper variables**:
   - Go to **Email Templates**
   - Make sure `{{to_email}}`, `{{verification_link}}`, etc. are in the template

---

**Last Updated:** December 7, 2025
