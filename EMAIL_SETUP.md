# Email Service Setup Guide

## Overview
Email notifications are configured using Firebase Cloud Functions with Nodemailer and Gmail SMTP.

## Configuration

### Google App Password
- **App Password:** `byrr ejvo iynq wzyb`
- **Gmail Account:** Replace `noreply@ldcalusic.firebaseapp.com` with your actual Gmail address in `functions/index.js`

### Admin Email
- **Admin Email:** Replace `info@ldcalusic.com` with your actual admin email in `functions/index.js`

## Email Triggers

### 1. Booking Confirmation (onCreate)
**Triggered when:** A new booking is created in Firestore

**Emails sent:**
- **Customer Email:** Booking confirmation with all details
- **Admin Email:** New booking notification with customer info

**Template includes:**
- Booking ID
- Service type
- Date and time
- Customer contact info
- Additional notes

### 2. Status Update (onUpdate)
**Triggered when:** Booking status changes

**Status types:**
- `pending` - Booking received
- `confirmed` - Booking confirmed
- `completed` - Service completed
- `cancelled` - Booking cancelled

## Installation Steps

### 1. Install Dependencies
```bash
cd functions
npm install
```

### 2. Initialize Firebase Functions
If not already initialized:
```bash
firebase init functions
```

### 3. Deploy Functions
```bash
firebase deploy --only functions
```

## Email Templates

### Customer Confirmation Email
- Professional branded design
- Blue/red color scheme matching website
- Booking details in organized table
- Contact information
- Next steps information

### Admin Notification Email
- Urgent action required notice
- Customer contact details (clickable)
- Full booking information
- Link to admin panel
- Timestamp

### Status Update Email
- Status-specific messaging
- Color-coded status badges
- Booking reference
- Contact information

## Testing

### Test Booking Creation
1. Create a new booking through the website
2. Check customer email inbox
3. Check admin email inbox
4. Verify both emails received

### Test Status Update
1. Go to admin panel
2. Change booking status
3. Check customer email for status update

## Customization

### Update Email Content
Edit templates in `functions/index.js`:
- Customer confirmation: `customerMailOptions.html`
- Admin notification: `adminMailOptions.html`
- Status updates: `sendStatusUpdateEmail` function

### Update Sender Email
Replace in `functions/index.js`:
```javascript
auth: {
  user: 'your-email@gmail.com',
  pass: 'byrr ejvo iynq wzyb'
}
```

### Update Admin Email
Replace in `functions/index.js`:
```javascript
to: 'your-admin-email@gmail.com'
```

## Security Notes

⚠️ **Important:**
- App password is stored in Cloud Functions (secure)
- Never commit passwords to public repositories
- Use environment variables for production:
  ```bash
  firebase functions:config:set gmail.email="your-email@gmail.com"
  firebase functions:config:set gmail.password="your-app-password"
  ```

## Troubleshooting

### Emails Not Sending
1. Check Firebase Functions logs:
   ```bash
   firebase functions:log
   ```

2. Verify Gmail settings:
   - 2-Step Verification enabled
   - App password is correct
   - "Less secure app access" not needed (using app password)

3. Check Firestore triggers:
   - Ensure bookings collection exists
   - Verify document structure

### Email in Spam
- Add SPF/DKIM records to your domain
- Use a custom domain email instead of Gmail
- Ask users to whitelist your email

## Cost Estimation

Firebase Cloud Functions pricing:
- **Free tier:** 2M invocations/month
- **Typical usage:** ~2-4 emails per booking
- **Expected cost:** Free for small businesses

## Future Enhancements

- [ ] HTML email templates with variables
- [ ] Email scheduling for reminders
- [ ] SMS notifications integration
- [ ] Email analytics and tracking
- [ ] Custom domain email (e.g., @ldcalusic.com)
- [ ] Multi-language email templates
- [ ] Email attachments (invoices, receipts)

## Support

For issues or questions:
- Check Firebase Console > Functions
- Review function logs
- Test with Firebase emulator locally
