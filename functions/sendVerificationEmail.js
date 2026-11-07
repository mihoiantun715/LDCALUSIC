const emailTemplates = require('./email-templates');
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'noreply@ldcalusic.firebaseapp.com', // Replace with your Gmail
    pass: 'byrr ejvo iynq wzyb' // Google App Password
  }
});

// Send verification code email
exports.sendVerificationCode = functions.https.onCall(async (data, context) => {
  const { email, code } = data;

  if (!email || !code) {
    throw new functions.https.HttpsError('invalid-argument', 'Email and code are required');
  }

  const mailOptions = {
    from: 'LD ČALUŠIĆ <noreply@ldcalusic.firebaseapp.com>',
    to: email,
    subject: 'Verifikacijski kod - LD ČALUŠIĆ',
    ...emailTemplates.verification(code)
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Verification code sent' };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send verification email');
  }
});
