# 📧 EmailJS Setup Guide - FREE Email Sending

EmailJS allows you to send emails directly from JavaScript without a backend server.

## 🚀 Quick Setup (5 minutes)

### Step 1: Create EmailJS Account

1. Go to https://www.emailjs.com/
2. Click **"Sign Up Free"**
3. Create account with your email

### Step 2: Add Email Service

1. Go to **Email Services** in dashboard
2. Click **"Add New Service"**
3. Select **"Gmail"**
4. Click **"Connect Account"**
5. Sign in with your Gmail: `ldcalusicusluge@gmail.com`
6. Allow EmailJS access
7. Name it: "LD Calusic Gmail"
8. Click **"Create Service"**
9. **Copy the Service ID** (e.g., `service_abc123`)

### Step 3: Create Email Template

1. Go to **Email Templates** in dashboard
2. Click **"Create New Template"**
3. Set up the template:

**Subject:**
```
Verifikacijski kod - LD ČALUŠIĆ
```

**Content (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e5ba8, #5ba8e5); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f5f5f5; padding: 30px; border-radius: 0 0 10px 10px; }
    .code-box { background: white; padding: 30px; text-align: center; border-radius: 10px; margin: 20px 0; border: 2px dashed #1e5ba8; }
    .code { font-size: 36px; font-weight: bold; color: #1e5ba8; letter-spacing: 8px; font-family: 'Courier New', monospace; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verifikacijski Kod</h1>
      <p>LD ČALUŠIĆ - Rezervacija Usluge</p>
    </div>
    <div class="content">
      <p>Poštovani {{to_name}},</p>
      <p>Vaš verifikacijski kod za rezervaciju usluge je:</p>
      
      <div class="code-box">
        <div class="code">{{verification_code}}</div>
      </div>

      <p>Unesite ovaj kod u obrazac za rezervaciju kako biste potvrdili svoju email adresu.</p>
      
      <p><strong>Važno:</strong></p>
      <ul>
        <li>Kod je valjan 10 minuta</li>
        <li>Nikada ne dijelite ovaj kod s drugima</li>
      </ul>

      <p style="text-align: center; margin-top: 30px; color: #666;">
        <strong>LD ČALUŠIĆ</strong><br>
        Prijevoz, Čišćenje i Održavanje
      </p>
    </div>
  </div>
</body>
</html>
```

4. Set **To Email**: `{{to_email}}`
5. Set **From Name**: `LD ČALUŠIĆ`
6. Click **"Save"**
7. **Copy the Template ID** (e.g., `template_xyz789`)

### Step 4: Get Your Public Key

1. Go to **Account** → **General**
2. Find **"Public Key"**
3. **Copy the Public Key** (e.g., `user_abc123xyz`)

### Step 5: Update Your Code

Open `script.js` and replace these values at the top:

```javascript
const EMAILJS_PUBLIC_KEY = 'your_public_key_here';
const EMAILJS_SERVICE_ID = 'your_service_id_here';
const EMAILJS_TEMPLATE_ID = 'your_template_id_here';
```

### Step 6: Deploy

```bash
firebase deploy --only hosting
```

---

## ✅ Testing

1. Go to your website booking form
2. Enter an email address
3. Click "Pošalji verifikacijski kod"
4. Check your email inbox
5. Enter the 6-digit code
6. Complete booking

---

## 💰 EmailJS Pricing

**Free Plan:**
- 200 emails/month
- 2 email templates
- Perfect for small businesses

**Paid Plans (if needed later):**
- $9/month: 1,000 emails
- $25/month: 5,000 emails

---

## 🔒 Security

- Public key is safe to expose (it's meant to be public)
- EmailJS validates requests on their server
- Rate limiting prevents abuse
- No sensitive credentials in frontend code

---

## 🐛 Troubleshooting

### Email not sending?

1. Check browser console for errors
2. Verify Service ID, Template ID, and Public Key
3. Make sure Gmail is connected in EmailJS dashboard
4. Check EmailJS dashboard for email logs

### Email in spam?

- Normal for first few emails
- Ask recipients to mark as "Not Spam"
- EmailJS uses your Gmail, so deliverability is good

---

## 📚 Template Variables

These variables are sent from your code:

| Variable | Description |
|----------|-------------|
| `{{to_email}}` | Recipient email address |
| `{{to_name}}` | Name extracted from email |
| `{{verification_code}}` | 6-digit verification code |

---

## 🎉 Done!

Once configured, emails will be sent automatically when users request verification codes!
