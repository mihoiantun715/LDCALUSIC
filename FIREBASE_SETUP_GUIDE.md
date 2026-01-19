# 🔥 Firebase Setup Guide - Complete Migration

## ✅ What's Been Done

Your application has been fully migrated to use Firebase services:

1. ✅ **Firebase Configuration** - `firebase-config.js` created
2. ✅ **Authentication Helper** - `firebase-auth.js` with all auth functions
3. ✅ **Firestore Security Rules** - `firestore.rules` created
4. ✅ **Frontend Updated** - All HTML files use Firebase SDK
5. ✅ **Login/Register** - Migrated to Firebase Authentication
6. ✅ **Bookings** - Migrated to Firestore Database
7. ✅ **Admin Dashboard** - Migrated to Firebase Auth & Firestore

---

## 🚀 Required Steps in Firebase Console

### **Step 1: Enable Authentication**

1. Go to [Firebase Console](https://console.firebase.google.com/project/ldcalusic)
2. Click **Authentication** in left menu
3. Click **Get Started** (if first time)
4. Go to **Sign-in method** tab
5. Click **Email/Password**
6. Toggle **Enable**
7. Click **Save**

### **Step 2: Create Firestore Database**

1. In Firebase Console, click **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
   - Or **production mode** (you'll update rules later)
4. Select location: **europe-west** (closest to Croatia)
5. Click **Enable**

### **Step 3: Deploy Firestore Security Rules**

After creating the database:

```bash
firebase deploy --only firestore:rules
```

Or manually copy rules from `firestore.rules` to Firebase Console:
1. Go to Firestore Database → Rules
2. Copy content from `firestore.rules`
3. Click **Publish**

### **Step 4: Create Admin User**

#### **Option A: Using Firebase Console**
1. Go to Authentication → Users
2. Click **Add user**
3. Email: `admin@ldcalusic.hr`
4. Password: `admin123` (or your preferred password)
5. Click **Add user**

#### **Option B: Register through your website**
1. Go to your website
2. Click Register
3. Use email: `admin@ldcalusic.hr`
4. Set password

### **Step 5: Set Admin Custom Claim**

You need to mark the admin user. Create this file:

**`set-admin.js`** (run once):
```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./path-to-your-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Replace with your admin user's UID from Firebase Console
const adminUid = 'YOUR_ADMIN_USER_UID';

admin.firestore().collection('admins').doc(adminUid).set({
  role: 'admin',
  email: 'admin@ldcalusic.hr',
  createdAt: admin.firestore.FieldValue.serverTimestamp()
}).then(() => {
  console.log('Admin user created successfully!');
  process.exit();
});
```

Run it:
```bash
node set-admin.js
```

Or manually add in Firestore Console:
1. Go to Firestore Database
2. Click **Start collection**
3. Collection ID: `admins`
4. Document ID: (paste admin user UID from Authentication)
5. Add field:
   - Field: `role`
   - Type: `string`
   - Value: `admin`
6. Add field:
   - Field: `email`
   - Type: `string`
   - Value: `admin@ldcalusic.hr`

---

## 📊 Firestore Database Structure

Your database will have these collections:

### **`users`** Collection
```javascript
{
  uid: "user_id",
  name: "User Name",
  email: "user@example.com",
  phone: "+385...",
  createdAt: timestamp,
  role: "user"
}
```

### **`bookings`** Collection
```javascript
{
  userId: "user_id",
  serviceCategory: "transport",
  service: "vehicle_transport",
  date: "2026-01-20",
  time: "10:00",
  from: "Zagreb",
  to: "Split",
  serviceDescription: "Transport automobila",
  approxWeight: "1500",
  notes: "Additional notes",
  status: "pending",
  createdAt: timestamp
}
```

### **`public_bookings`** Collection
```javascript
{
  name: "Guest Name",
  email: "guest@example.com",
  phone: "+385...",
  service: "transport",
  from: "Zagreb",
  to: "Split",
  date: "2026-01-20",
  time: "10:00",
  message: "Additional info",
  status: "pending",
  createdAt: timestamp
}
```

### **`admins`** Collection
```javascript
{
  role: "admin",
  email: "admin@ldcalusic.hr",
  createdAt: timestamp
}
```

---

## 🔒 Security Rules Explained

### **Users Collection**
- Users can read/write their own profile
- Admins can delete users

### **Bookings Collection**
- Users can read their own bookings
- Users can create bookings (must be authenticated)
- Only admins can update/delete bookings

### **Public Bookings Collection**
- Anyone can create (contact form)
- Only admins can read/update/delete

### **Admins Collection**
- Only admins can read
- Cannot be modified from client (security)

---

## 🎯 Testing Your Setup

### **1. Test User Registration**
```
1. Go to your website
2. Click "Registracija"
3. Fill in details
4. Submit
5. Check Firebase Console → Authentication
```

### **2. Test User Login**
```
1. Click "Prijava"
2. Enter registered email/password
3. Should redirect to dashboard
```

### **3. Test Booking Creation**
```
1. Login as user
2. Go to dashboard
3. Create a booking
4. Check Firestore Console → bookings collection
```

### **4. Test Admin Login**
```
1. Go to admin-login.html
2. Enter admin@ldcalusic.hr
3. Enter password
4. Should redirect to admin dashboard
```

### **5. Test Admin Functions**
```
1. View all bookings
2. Update booking status
3. Delete booking
4. View all users
```

---

## 🚀 Deployment

### **Deploy to Firebase Hosting**
```bash
# Deploy everything
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only Firestore rules
firebase deploy --only firestore:rules
```

### **Your Live URLs**
- **Website:** `https://ldcalusic.web.app`
- **Alternative:** `https://ldcalusic.firebaseapp.com`

---

## ⚙️ Environment Variables

No backend server needed! Everything runs on Firebase:
- ✅ Authentication → Firebase Auth
- ✅ Database → Firestore
- ✅ Hosting → Firebase Hosting
- ✅ Analytics → Firebase Analytics

---

## 🔧 Troubleshooting

### **"Permission denied" errors**
- Make sure Firestore rules are deployed
- Check if user is authenticated
- For admin actions, verify admin document exists

### **"User not found" on login**
- User must be registered first
- Check Firebase Console → Authentication

### **Admin can't login**
- Verify admin document exists in `admins` collection
- Check document ID matches user UID
- Verify `role` field is set to "admin"

### **Bookings not showing**
- Check browser console for errors
- Verify Firestore rules allow read access
- Check if bookings collection exists

---

## 📞 Next Steps

1. ✅ Enable Authentication in Firebase Console
2. ✅ Create Firestore Database
3. ✅ Deploy Firestore Rules
4. ✅ Create admin user
5. ✅ Add admin to `admins` collection
6. ✅ Test all functionality
7. ✅ Deploy to Firebase Hosting

---

## 🎉 Benefits of Firebase Migration

- ✅ **No Backend Server** - Everything serverless
- ✅ **Real-time Updates** - Firestore real-time sync
- ✅ **Scalable** - Auto-scales with traffic
- ✅ **Secure** - Firebase security rules
- ✅ **Fast** - Global CDN
- ✅ **Free Tier** - Generous free quota
- ✅ **Analytics** - Built-in user tracking

Your application is now fully cloud-native! 🚀
