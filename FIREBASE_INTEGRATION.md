# Firebase Integration Guide

## ✅ Firebase SDK Integrated

Your Firebase configuration has been added to the project with the following setup:

**Project ID:** `ldcalusic`  
**Auth Domain:** `ldcalusic.firebaseapp.com`

---

## 📁 Files Created/Updated

### **New Files:**
- ✅ `firebase-config.js` - Firebase client SDK configuration

### **Updated Files:**
- ✅ `index.html` - Added Firebase SDK
- ✅ `dashboard.html` - Added Firebase SDK
- ✅ `admin.html` - Added Firebase SDK
- ✅ `admin-login.html` - Added Firebase SDK

---

## 🔥 Firebase Services Available

### **1. Firebase Authentication**
- User registration and login
- Email/password authentication
- Session management
- Admin authentication

### **2. Firestore Database**
- Real-time database
- User data storage
- Bookings storage
- Admin data management

### **3. Firebase Analytics**
- User behavior tracking
- Page view analytics
- Event tracking

---

## 🚀 Next Steps to Complete Integration

### **Step 1: Enable Firebase Services**

Go to [Firebase Console](https://console.firebase.google.com/project/ldcalusic)

1. **Enable Authentication:**
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"
   - Click Save

2. **Enable Firestore Database:**
   - Go to Firestore Database
   - Click "Create database"
   - Start in **production mode** or **test mode**
   - Choose your region (europe-west for Europe)

3. **Set up Firestore Rules:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users collection
       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth.uid == userId;
       }
       
       // Bookings collection
       match /bookings/{bookingId} {
         allow read: if request.auth != null;
         allow create: if request.auth != null;
         allow update, delete: if request.auth.token.admin == true;
       }
       
       // Admin only collections
       match /admin/{document=**} {
         allow read, write: if request.auth.token.admin == true;
       }
     }
   }
   ```

### **Step 2: Create Admin User**

You need to create an admin user and set custom claims:

1. Create the admin user in Firebase Console:
   - Go to Authentication → Users
   - Add user with email: `admin@ldcalusic.hr`
   - Set password: `admin123` (or your preferred password)

2. Set admin custom claim (requires Firebase Admin SDK or Firebase CLI):
   ```bash
   firebase auth:import admin-user.json
   ```

Or use Firebase Functions to set admin claim programmatically.

### **Step 3: Install Firebase Admin SDK (Backend)**

```bash
npm install firebase-admin
```

### **Step 4: Update Backend to Use Firebase**

The current `server.js` uses local JSON files. You can:

**Option A:** Keep current backend for local development  
**Option B:** Migrate to Firebase Functions (serverless)  
**Option C:** Use Firebase Admin SDK in current backend

---

## 📊 Current Implementation Status

### ✅ Completed:
- Firebase configuration file created
- Firebase SDK added to all HTML pages
- Scripts updated to use ES6 modules
- Analytics initialized

### ⏳ Pending (Manual Steps Required):
- Enable Authentication in Firebase Console
- Enable Firestore in Firebase Console
- Create admin user with custom claims
- Migrate backend to use Firestore (optional)
- Update Firestore security rules

---

## 🔧 Code Structure

### **Frontend (Client SDK):**
```javascript
// firebase-config.js exports:
- auth (Authentication)
- db (Firestore)
- analytics (Analytics)
- All auth methods
- All Firestore methods
```

### **Usage Example:**
```javascript
import { auth, signInWithEmailAndPassword } from './firebase-config.js';

// Login user
const userCredential = await signInWithEmailAndPassword(auth, email, password);
```

---

## 🌐 Deployment Options

### **Option 1: Static + Backend Separate**
- Deploy frontend to Firebase Hosting
- Deploy backend to Heroku/Railway/Render
- Update API URLs in frontend

### **Option 2: Full Firebase (Recommended)**
- Migrate to Firebase Functions for backend
- Use Firestore for database
- Everything on Firebase platform

### **Option 3: Hybrid**
- Keep current Node.js backend
- Add Firebase Admin SDK
- Use Firestore instead of JSON files

---

## 📝 Important Notes

1. **API Keys are Public:** The Firebase config with API keys is safe to expose in frontend code. Firebase security is handled by Firestore rules and Authentication.

2. **Admin Authentication:** Admin users need custom claims set via Firebase Admin SDK or Console.

3. **Firestore vs JSON Files:** Current backend uses JSON files. For production, migrate to Firestore for better scalability and real-time features.

4. **CORS:** If keeping separate backend, ensure CORS is properly configured for your Firebase domain.

---

## 🎯 Quick Start Commands

```bash
# Deploy to Firebase Hosting
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy functions (if using Firebase Functions)
firebase deploy --only functions

# View logs
firebase functions:log
```

---

## 📞 Support

For Firebase-specific issues, refer to:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/project/ldcalusic)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
