# 🚀 Firebase Deployment Guide - Complete Migration

## ✅ What's Been Completed

Your application is now **100% Firebase-based** with no local storage dependencies:

### **Authentication**
- ✅ User registration → Firebase Authentication
- ✅ User login → Firebase Authentication  
- ✅ Admin login → Firebase Authentication + Firestore role check
- ✅ Session persistence → Firebase Auth (automatic)
- ✅ No localStorage for auth tokens

### **Database**
- ✅ User profiles → Firestore `users` collection
- ✅ Bookings → Firestore `bookings` collection
- ✅ Public bookings → Firestore `public_bookings` collection
- ✅ Admin roles → Firestore `admins` collection

### **Routing**
- ✅ Clean URLs without hash (#)
- ✅ Smooth scroll navigation
- ✅ Firebase hosting rewrites configured

---

## 🔥 Firebase Console Setup (Required)

### **Step 1: Enable Authentication**
1. Go to [Firebase Console](https://console.firebase.google.com/project/ldcalusic/authentication)
2. Click **Authentication** → **Sign-in method**
3. Enable **Email/Password**
4. Click **Save**

### **Step 2: Create Firestore Database**
1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Test mode** (for development) or **Production mode**
4. Select location: **europe-west3** (Frankfurt - closest to Croatia)
5. Click **Enable**

### **Step 3: Deploy Firestore Rules**
Run this command:
```bash
firebase deploy --only firestore:rules
```

Or manually in Console:
1. Go to Firestore Database → Rules
2. Copy content from `firestore.rules` file
3. Click **Publish**

### **Step 4: Create Admin User**

#### **Option A: Register through website**
1. Go to your website
2. Click "Registracija"
3. Register with:
   - Email: `admin@ldcalusic.hr`
   - Password: `admin123` (or your choice)
   - Name: Admin
   - Phone: Your phone

#### **Option B: Firebase Console**
1. Go to Authentication → Users
2. Click **Add user**
3. Email: `admin@ldcalusic.hr`
4. Password: `admin123`

### **Step 5: Set Admin Role in Firestore**

After creating the admin user:

1. Go to **Authentication** → **Users**
2. Copy the **User UID** of admin@ldcalusic.hr
3. Go to **Firestore Database**
4. Click **Start collection**
5. Collection ID: `admins`
6. Document ID: **[paste the User UID]**
7. Add fields:
   - Field: `role`, Type: `string`, Value: `admin`
   - Field: `email`, Type: `string`, Value: `admin@ldcalusic.hr`
8. Click **Save**

---

## 🚀 Deploy to Firebase Hosting

### **Deploy Everything**
```bash
firebase deploy
```

### **Deploy Only Hosting**
```bash
firebase deploy --only hosting
```

### **Deploy Only Firestore Rules**
```bash
firebase deploy --only firestore:rules
```

---

## 🌐 Your Live URLs

After deployment:
- **Main Website:** `https://ldcalusic.web.app`
- **Alternative:** `https://ldcalusic.firebaseapp.com`
- **Admin Login:** `https://ldcalusic.web.app/admin-login.html`
- **User Dashboard:** `https://ldcalusic.web.app/dashboard.html`
- **Admin Dashboard:** `https://ldcalusic.web.app/admin.html`

---

## 📊 How It Works Now

### **User Flow**
1. User registers → Firebase Auth creates account + Firestore stores profile
2. User logs in → Firebase Auth validates + session persists
3. User creates booking → Stored in Firestore `bookings` collection
4. User views bookings → Loaded from Firestore
5. User logs out → Firebase Auth signs out

### **Admin Flow**
1. Admin logs in → Firebase Auth validates
2. System checks Firestore `admins` collection for role
3. If admin role exists → Access granted
4. Admin views all bookings → Loaded from Firestore
5. Admin updates status → Updated in Firestore
6. Admin deletes booking → Deleted from Firestore

### **Guest Flow**
1. Guest fills contact form → Stored in Firestore `public_bookings`
2. Admin can view public bookings → Loaded from Firestore

---

## 🔒 Security

### **Firestore Rules Protect:**
- Users can only read/write their own data
- Bookings are user-specific
- Only admins can update/delete bookings
- Admin collection is read-only from client
- Public bookings are write-only for guests

### **Authentication:**
- Firebase Auth handles all security
- Sessions persist automatically
- No tokens in localStorage
- Secure password hashing

---

## 🧪 Testing Checklist

### **Test User Registration**
- [ ] Go to website
- [ ] Click "Registracija"
- [ ] Fill form and submit
- [ ] Check Firebase Console → Authentication (user should appear)
- [ ] Check Firestore → `users` collection (profile should appear)

### **Test User Login**
- [ ] Click "Prijava"
- [ ] Enter registered email/password
- [ ] Should redirect to dashboard
- [ ] Profile info should load from Firestore

### **Test Booking Creation**
- [ ] Login as user
- [ ] Go to dashboard
- [ ] Create a booking
- [ ] Check Firestore → `bookings` collection

### **Test Admin Login**
- [ ] Go to `/admin-login.html`
- [ ] Login with admin@ldcalusic.hr
- [ ] Should redirect to admin dashboard
- [ ] Should see all bookings and users

### **Test Admin Functions**
- [ ] View all bookings
- [ ] Update booking status
- [ ] Delete booking
- [ ] View all users
- [ ] View statistics

---

## 🎯 What's Different from Before

### **Before (Local Backend)**
- ❌ Node.js server required
- ❌ JSON files for data storage
- ❌ localStorage for auth tokens
- ❌ Manual session management
- ❌ Server must be running

### **After (Firebase)**
- ✅ No backend server needed
- ✅ Firestore cloud database
- ✅ Firebase Auth (automatic persistence)
- ✅ Automatic session management
- ✅ Always available (cloud-hosted)

---

## 💰 Firebase Free Tier Limits

Your application is well within free tier:
- **Authentication:** 10,000 verifications/month
- **Firestore:** 50,000 reads/day, 20,000 writes/day
- **Hosting:** 10 GB storage, 360 MB/day transfer
- **Analytics:** Unlimited

---

## 🔧 Troubleshooting

### **"Permission denied" in Firestore**
- Deploy Firestore rules: `firebase deploy --only firestore:rules`
- Check user is authenticated
- For admin actions, verify admin document exists

### **Admin can't login**
- Verify admin user exists in Authentication
- Check `admins` collection has document with user's UID
- Verify `role` field is set to "admin"

### **Bookings not showing**
- Check browser console for errors
- Verify Firestore rules are deployed
- Check if bookings collection exists

### **Login redirects to home**
- Check Firebase Auth is enabled
- Verify user credentials are correct
- Check browser console for errors

---

## 📞 Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/project/ldcalusic)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

---

## ✨ Summary

Your application is now:
- ✅ **100% serverless** - No backend needed
- ✅ **100% cloud-based** - All data in Firebase
- ✅ **Secure** - Firebase security rules
- ✅ **Scalable** - Auto-scales with traffic
- ✅ **Fast** - Global CDN
- ✅ **Free** - Within generous free tier

**Ready to deploy!** 🚀
