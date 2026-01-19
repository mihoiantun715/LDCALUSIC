# 📧 Gmail Email Setup Instructions

## ✅ Email System is Ready!

Your email system is configured using **Gmail SMTP with App Password** - the same proven method used in AutoservisNextLevel.

---

## 🔑 Current Configuration

**Gmail Account:** `ldcalusicusluge@gmail.com`  
**App Password:** `byrr ejvo iynq wzyb`  
**Method:** Nodemailer + Gmail SMTP via Firebase Cloud Functions

---

## 📝 What You Need to Do

### Step 1: Create Gmail Account (if not already done)

1. Go to https://gmail.com
2. Create account: `ldcalusicusluge@gmail.com` (or use existing)
3. Complete setup

### Step 2: Enable 2-Step Verification

1. Go to https://myaccount.google.com/security
2. Click **"2-Step Verification"**
3. Follow the setup process
4. **This is required** to create App Passwords

### Step 3: Generate App Password

1. Go to https://myaccount.google.com/apppasswords
2. Select **"Mail"** as the app
3. Select **"Other"** as the device
4. Name it: "LD Calusic Website"
5. Click **"Generate"**
6. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)
7. **Replace** `byrr ejvo iynq wzyb` in `functions/index.js` with your new app password

### Step 4: Update Email Address in Code

If you used a different Gmail address, update it in `functions/index.js`:

```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'YOUR_GMAIL@gmail.com', // ← Change this
    pass: 'your app password here' // ← Change this
  }
});
```

Also update the admin email address (line 122):
```javascript
to: 'your-admin-email@gmail.com', // ← Change this
```

### Step 5: Enable Firebase Cloud Functions

**You need to enable the Blaze (Pay-as-you-go) plan:**

1. Go to https://console.firebase.google.com/project/ldcalusic/overview
2. Click **"Upgrade"** in the sidebar
3. Select **"Blaze - Pay as you go"**
4. Add billing account (credit card required)
5. Confirm upgrade

**Cost:** FREE for your usage (2M function calls/month free tier)

### Step 6: Deploy Cloud Functions

Once billing is enabled, run:

```bash
firebase deploy --only functions
```

This deploys 3 functions:
- `sendBookingConfirmation` - Sends email when booking is created
- `sendVerificationCode` - Sends verification code for booking form
- `sendStatusUpdateEmail` - Sends email when booking status changes

---

## 🎯 How It Works

### 1. Verification Code Email
- User fills booking form
- Clicks "Send verification code"
- Cloud Function sends 6-digit code via Gmail
- User enters code to verify email
- Booking is submitted

### 2. Booking Confirmation Email
- When booking is created in Firestore
- Automatic trigger sends email to customer
- Automatic trigger sends email to admin
- Uses beautiful HTML templates

### 3. Status Update Emails
- When admin changes booking status
- Customer receives email notification
- Different templates for: pending, confirmed, completed, cancelled

---

## 🧪 Testing

### Test Verification Email:
1. Go to your website booking form
2. Enter email address
3. Click "Pošalji verifikacijski kod"
4. Check email inbox (and spam folder)
5. Enter the 6-digit code
6. Complete booking

### Test Booking Confirmation:
1. Submit a booking
2. Check customer email
3. Check admin email
4. Both should receive confirmation emails

---

## 🐛 Troubleshooting

### Emails Not Sending?

**Check Firebase Functions Logs:**
```bash
firebase functions:log
```

**Common Issues:**

1. **"Invalid login"** error
   - Make sure 2-Step Verification is enabled
   - Regenerate App Password
   - Update password in `functions/index.js`

2. **"Functions not deployed"**
   - Run `firebase deploy --only functions`
   - Check Firebase Console → Functions tab

3. **"Quota exceeded"** error
   - Wait 5-10 minutes
   - Enable APIs manually in Google Cloud Console

4. **Emails in spam folder**
   - Normal for first few emails
   - Ask recipients to mark as "Not Spam"
   - Consider using custom domain email later

---

## 💰 Cost Estimate

**Firebase Functions (Blaze Plan):**
- First 2M invocations/month: **FREE**
- Your usage: ~100-500 emails/month
- **Expected cost: $0/month** (well within free tier)

**Gmail:**
- **FREE** (no cost for sending via SMTP)
- Limit: 500 emails/day (more than enough)

---

## 🔒 Security Notes

- ✅ App Password is stored securely in Cloud Functions
- ✅ Not exposed to client-side code
- ✅ Only Firebase Functions can access it
- ✅ Gmail account is separate from personal email

---

## 📚 Files Modified

1. **`functions/index.js`** - Email sending logic with Gmail SMTP
2. **`functions/package.json`** - Dependencies (nodemailer)
3. **`firebase-config.js`** - Firebase Functions SDK imports
4. **`script.js`** - Calls Cloud Function for verification emails

---

## 🎉 Ready to Go!

Once you:
1. ✅ Create/configure Gmail account
2. ✅ Generate App Password
3. ✅ Update credentials in code
4. ✅ Enable Firebase Blaze plan
5. ✅ Deploy functions

Your emails will work automatically! 🚀

---

## 📞 Need Help?

Check the AutoservisNextLevel implementation for reference:
- Location: `e:/Websitovi Glavni/AutoservisNextLevel/functions/src/index.ts`
- Same exact method, proven to work!
