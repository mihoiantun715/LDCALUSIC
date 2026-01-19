# Google Sign-In Setup Guide

## ✅ Code Integration Complete

Google Sign-In has been integrated into your application. Now you need to configure it in Firebase Console.

---

## 🔧 Required: Firebase Console Setup

### **Step 1: Enable Google Sign-In Provider**

1. Go to [Firebase Console - Authentication](https://console.firebase.google.com/project/ldcalusic/authentication/providers)
2. Click **Sign-in method** tab
3. Find **Google** in the list
4. Click **Google** to expand
5. Toggle **Enable** switch to ON
6. **Important:** Add your OAuth Client ID

### **Step 2: Configure OAuth Client**

You provided: `570944285695-s85mlhb7d71nkom4m8hlvu2f5tq9ctui.apps.googleusercontent.com`

In Firebase Console:
1. Under **Web SDK configuration**
2. Paste your Client ID: `570944285695-s85mlhb7d71nkom4m8hlvu2f5tq9ctui.apps.googleusercontent.com`
3. Click **Save**

### **Step 3: Add Authorized Domains**

Make sure these domains are authorized:
- `localhost` (for local testing)
- `ldcalusic.web.app` (your Firebase hosting domain)
- `ldcalusic.firebaseapp.com` (alternative domain)

To add:
1. In Firebase Console → Authentication → Settings
2. Scroll to **Authorized domains**
3. Click **Add domain** if needed
4. Add your custom domain if you have one

---

## 🎯 How It Works

### **User Flow:**

1. User clicks "Prijavi se sa Google" or "Registriraj se sa Google"
2. Google popup opens
3. User selects Google account
4. Firebase authenticates user
5. If first-time user:
   - Creates user document in Firestore
   - Stores: name, email, role
6. Redirects to dashboard

### **Data Stored:**

```javascript
{
  uid: "google_user_id",
  name: "User Name from Google",
  email: "user@gmail.com",
  phone: "", // Empty initially
  createdAt: timestamp,
  role: "user",
  provider: "google"
}
```

---

## 🔒 Security

### **Firestore Rules Already Handle:**
- Google-authenticated users can read/write their own data
- Same security rules apply as email/password users
- Admin role checking works the same way

---

## ✨ Features Added

### **Login Modal:**
- ✅ "Prijavi se sa Google" button
- ✅ Blue Google icon
- ✅ Hover effects
- ✅ "ili" divider

### **Registration Modal:**
- ✅ "Registriraj se sa Google" button
- ✅ Same styling as login
- ✅ Creates user account automatically

### **Error Handling:**
- ✅ Popup closed by user
- ✅ Popup blocked by browser
- ✅ Network errors
- ✅ User-friendly Croatian messages

---

## 🧪 Testing

### **After Firebase Console Setup:**

1. **Test Login:**
   - Go to https://ldcalusic.web.app
   - Click "Prijava"
   - Click "Prijavi se sa Google"
   - Select Google account
   - Should redirect to dashboard

2. **Test Registration:**
   - Click "Registracija"
   - Click "Registriraj se sa Google"
   - Select Google account
   - Should create account and redirect to dashboard

3. **Verify in Firebase:**
   - Go to Authentication → Users
   - New user should appear with Google provider icon
   - Go to Firestore → users collection
   - User document should exist with Google data

---

## 🚨 Troubleshooting

### **"Popup blocked" error:**
- User needs to allow popups for your site
- Check browser popup blocker settings

### **"Unauthorized domain" error:**
- Add domain to Firebase Console → Authentication → Settings → Authorized domains

### **"Invalid OAuth client" error:**
- Verify Client ID is correct in Firebase Console
- Make sure Google Sign-In is enabled

### **User data not saving:**
- Check Firestore rules are deployed
- Verify user has write permission to their own document

---

## 📊 Benefits

- ✅ **Faster registration** - No password needed
- ✅ **Better security** - Google handles authentication
- ✅ **No password reset** - Google manages that
- ✅ **Trusted provider** - Users trust Google
- ✅ **Auto-fill data** - Name and email from Google

---

## 🎨 Design

The Google button matches your website design:
- White background with border
- Blue Google icon
- Hover effect: lifts up with blue shadow
- "ili" divider separates from email/password login
- Responsive and mobile-friendly

---

## 🚀 Next Steps

1. ✅ Enable Google Sign-In in Firebase Console
2. ✅ Add OAuth Client ID
3. ✅ Test login flow
4. ✅ Test registration flow
5. ✅ Verify user data in Firestore

Your Google Sign-In is ready to use! 🎉
