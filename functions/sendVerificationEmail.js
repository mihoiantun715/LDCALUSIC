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
    html: `
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
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verifikacijski Kod</h1>
            <p>LD ČALUŠIĆ - Rezervacija Usluge</p>
          </div>
          <div class="content">
            <p>Poštovani,</p>
            <p>Vaš verifikacijski kod za rezervaciju usluge je:</p>
            
            <div class="code-box">
              <div class="code">${code}</div>
            </div>

            <p>Unesite ovaj kod u obrazac za rezervaciju kako biste potvrdili svoju email adresu.</p>

            <div class="warning">
              <strong>⚠️ Važno:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Kod je valjan 10 minuta</li>
                <li>Nikada ne dijelite ovaj kod s drugima</li>
                <li>Ako niste zatražili ovaj kod, ignorirajte ovu poruku</li>
              </ul>
            </div>

            <p>Ako imate bilo kakvih pitanja, kontaktirajte nas:</p>
            <p>📞 Telefon: +385 XX XXX XXXX<br>
            📧 Email: info@ldcalusic.com</p>

            <div class="footer">
              <p><strong>LD ČALUŠIĆ</strong><br>
              Prijevoz, Čišćenje i Održavanje</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Verification code sent' };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send verification email');
  }
});
