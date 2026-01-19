# Vercel Deployment Guide for LD ČALUŠIĆ

## Important Note About Environment Variables

**You DON'T need a .env file for Vercel deployment!**

Your Firebase configuration is already in `firebase-config.js` and is **safe to be public** because:
- Firebase API keys are meant to be public
- Security is handled by Firebase Security Rules (already configured)
- The app password for Gmail is in Firebase Functions (server-side only)

---

## Step-by-Step Vercel Deployment

### 1. **Login to Vercel**
```bash
vercel login
```
- This will open your browser
- Login with your GitHub account

### 2. **Deploy to Vercel**
```bash
vercel
```

When prompted:
- **Set up and deploy?** → Press `Y` (Yes)
- **Which scope?** → Select your account
- **Link to existing project?** → Press `N` (No) - first time
- **What's your project's name?** → `ldcalusic` or `ld-calusic-prijevoz`
- **In which directory is your code located?** → Press Enter (current directory)
- **Want to override the settings?** → Press `N` (No)

### 3. **Production Deployment**
After the first deployment, deploy to production:
```bash
vercel --prod
```

---

## Vercel Configuration (Optional)

If you want to customize settings, create `vercel.json`:

```json
{
  "buildCommand": null,
  "outputDirectory": ".",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, must-revalidate"
        }
      ]
    }
  ]
}
```

---

## What Vercel Will Do

1. ✅ Host all your static files (HTML, CSS, JS)
2. ✅ Provide a custom domain (e.g., `ldcalusic.vercel.app`)
3. ✅ Automatic HTTPS
4. ✅ Global CDN for fast loading
5. ✅ Automatic deployments on git push (if you connect GitHub)

---

## What Stays on Firebase

Your Firebase services will continue to work:
- ✅ **Firebase Authentication** - User login/registration
- ✅ **Firestore Database** - All booking data
- ✅ **Firebase Functions** - Email sending (Gmail SMTP)
- ✅ **Firebase Storage** - If you add file uploads later

---

## Connecting GitHub for Auto-Deploy (Optional)

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository: `mihoiantun715/LDCALUSIC`
4. Click "Import"
5. Click "Deploy"

**Now every git push will automatically deploy to Vercel!**

---

## Custom Domain Setup (Optional)

1. Go to your Vercel project dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain (e.g., `ldcalusic.com`)
4. Follow DNS configuration instructions
5. Vercel will automatically provision SSL certificate

---

## Troubleshooting

### Issue: Firebase not working on Vercel
**Solution:** Make sure `firebase-config.js` is deployed with correct API keys (it should be)

### Issue: Functions not triggering
**Solution:** Firebase Functions run on Firebase servers, not Vercel. They work independently.

### Issue: CORS errors
**Solution:** Already handled by Firebase configuration

---

## Comparison: Firebase Hosting vs Vercel

| Feature | Firebase Hosting | Vercel |
|---------|-----------------|--------|
| Speed | Fast | Very Fast (Global CDN) |
| Free Tier | 10GB/month | 100GB/month |
| Custom Domain | ✅ Yes | ✅ Yes |
| Auto Deploy | ✅ GitHub Actions | ✅ Git Integration |
| Analytics | Firebase Analytics | Vercel Analytics |
| Edge Functions | Firebase Functions | Vercel Edge Functions |

**You can use BOTH!**
- Keep Firebase Functions for emails
- Use Vercel for hosting (faster global delivery)

---

## Current Status

✅ **Code pushed to GitHub:** `https://github.com/mihoiantun715/LDCALUSIC.git`  
✅ **Firebase Hosting:** `https://ldcalusic.web.app`  
⏳ **Vercel:** Ready to deploy with `vercel` command

---

## Quick Deploy Commands

```bash
# First time deployment
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Your GitHub Repo: https://github.com/mihoiantun715/LDCALUSIC
- Firebase Console: https://console.firebase.google.com/project/ldcalusic
