const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Email configuration - Gmail SMTP with App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ldcalusicprijevoziusluge@gmail.com',
    pass: 'likk rzdn orua jodl'
  }
});

// Send booking confirmation email
exports.sendBookingConfirmation = functions.firestore
  .document('bookings/{bookingId}')
  .onCreate(async (snap, context) => {
    const booking = snap.data();
    const bookingId = context.params.bookingId;

    console.log('Booking data received:', JSON.stringify(booking));
    
    // Validate required fields
    if (!booking.email) {
      console.error('No email address in booking data');
      return null;
    }
    
    if (!booking.name) {
      console.error('No name in booking data');
      return null;
    }

    // Email to customer
    const customerMailOptions = {
      from: 'LDCALUSIC PRIJEVOZ I USLUGE <ldcalusicprijevoziusluge@gmail.com>',
      to: booking.email,
      subject: 'Potvrda rezervacije - LDCALUSIC PRIJEVOZ I USLUGE',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e5ba8, #5ba8e5); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f5f5f5; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
            .detail-label { font-weight: 600; color: #1e5ba8; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .button { display: inline-block; background: #e31e24; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Potvrda Rezervacije</h1>
              <p>LDCALUSIC PRIJEVOZ I USLUGE</p>
            </div>
            <div class="content">
              <p>Poštovani/a ${booking.name},</p>
              <p>Vaša rezervacija je uspješno zaprimljena. Kontaktirat ćemo vas u najkraćem roku kako bismo potvrdili detalje.</p>
              
              <div class="booking-details">
                <h3 style="color: #1e5ba8; margin-top: 0;">Detalji rezervacije:</h3>
                <div class="detail-row">
                  <span class="detail-label">Broj rezervacije:</span>
                  <span>#${bookingId.substring(0, 8).toUpperCase()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Usluga:</span>
                  <span>${getServiceName(booking.service)}</span>
                </div>
                ${booking.from ? `
                <div class="detail-row">
                  <span class="detail-label">Polazište:</span>
                  <span>${booking.from}</span>
                </div>
                ` : ''}
                ${booking.to ? `
                <div class="detail-row">
                  <span class="detail-label">Odredište:</span>
                  <span>${booking.to}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                  <span class="detail-label">Datum:</span>
                  <span>${booking.date}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Vrijeme:</span>
                  <span>${booking.time}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Telefon:</span>
                  <span>${booking.phone}</span>
                </div>
                ${booking.message ? `
                <div class="detail-row">
                  <span class="detail-label">Napomena:</span>
                  <span>${booking.message}</span>
                </div>
                ` : ''}
              </div>

              <p><strong>Što dalje?</strong></p>
              <ul>
                <li>Naš tim će vas kontaktirati u roku od 24 sata</li>
                <li>Potvrditi ćemo sve detalje usluge</li>
                <li>Dogovoriti točno vrijeme i cijenu</li>
              </ul>

              <p>Ako imate bilo kakvih pitanja, slobodno nas kontaktirajte:</p>
              <p>📞 Telefon: 097 684 1992<br>
              📧 Email: ldcalusicprijevoziusluge@gmail.com</p>

              <div class="footer">
                <p>Hvala vam na povjerenju!</p>
                <p><strong>LDCALUSIC PRIJEVOZ I USLUGE</strong><br>
                Prijevoz, Čišćenje i Održavanje</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Email to admin
    const adminMailOptions = {
      from: 'LDCALUSIC PRIJEVOZ I USLUGE <ldcalusicprijevoziusluge@gmail.com>',
      to: 'ldcalusicprijevoziusluge@gmail.com',
      subject: `Nova rezervacija - ${getServiceName(booking.service)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #e31e24; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f5f5f5; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
            .detail-label { font-weight: 600; color: #1e5ba8; }
            .urgent { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Nova Rezervacija</h1>
            </div>
            <div class="content">
              <div class="urgent">
                <strong>⚠️ Akcija potrebna:</strong> Kontaktirajte klijenta u najkraćem roku!
              </div>
              
              <div class="booking-details">
                <h3 style="color: #1e5ba8; margin-top: 0;">Informacije o klijentu:</h3>
                <div class="detail-row">
                  <span class="detail-label">Ime:</span>
                  <span>${booking.name}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span><a href="mailto:${booking.email}">${booking.email}</a></span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Telefon:</span>
                  <span><a href="tel:${booking.phone}">${booking.phone}</a></span>
                </div>
              </div>

              <div class="booking-details">
                <h3 style="color: #1e5ba8; margin-top: 0;">Detalji usluge:</h3>
                <div class="detail-row">
                  <span class="detail-label">Broj rezervacije:</span>
                  <span>#${bookingId.substring(0, 8).toUpperCase()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Usluga:</span>
                  <span>${getServiceName(booking.service)}</span>
                </div>
                ${booking.serviceType ? `
                <div class="detail-row">
                  <span class="detail-label">Tip usluge:</span>
                  <span>${booking.serviceType}</span>
                </div>
                ` : ''}
                ${booking.from ? `
                <div class="detail-row">
                  <span class="detail-label">Polazište:</span>
                  <span>${booking.from}</span>
                </div>
                ` : ''}
                ${booking.to ? `
                <div class="detail-row">
                  <span class="detail-label">Odredište:</span>
                  <span>${booking.to}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                  <span class="detail-label">Datum:</span>
                  <span>${booking.date}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Vrijeme:</span>
                  <span>${booking.time}</span>
                </div>
                ${booking.message ? `
                <div class="detail-row">
                  <span class="detail-label">Dodatne informacije:</span>
                  <span>${booking.message}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                  <span class="detail-label">Kreirano:</span>
                  <span>${new Date(booking.createdAt).toLocaleString('hr-HR')}</span>
                </div>
              </div>

              <p style="text-align: center; margin-top: 30px;">
                <a href="https://ldcalusic.web.app/admin.html" style="display: inline-block; background: #1e5ba8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px;">
                  Otvori Admin Panel
                </a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      // Send both emails
      await transporter.sendMail(customerMailOptions);
      await transporter.sendMail(adminMailOptions);
      console.log(`Emails sent for booking ${bookingId}`);
      return null;
    } catch (error) {
      console.error('Error sending emails:', error);
      return null;
    }
  });

// Helper function to get service name in Croatian
function getServiceName(serviceCode) {
  const services = {
    'transport': 'Prijevoz i Dostava sa Instalacijom',
    'cleaning': 'Čišćenje Prostora',
    'garden': 'Održavanje Zelenih Površina',
    'rental': 'Najam Opreme',
    'special': 'Specijalne Usluge'
  };
  return services[serviceCode] || serviceCode;
}

// Send verification code email
exports.sendVerificationCode = functions.https.onCall(async (data, context) => {
  const { email, code } = data;

  if (!email || !code) {
    throw new functions.https.HttpsError('invalid-argument', 'Email and code are required');
  }

  const mailOptions = {
    from: 'LDCALUSIC PRIJEVOZ I USLUGE <ldcalusicprijevoziusluge@gmail.com>',
    to: email,
    subject: 'Verifikacijski kod - LDCALUSIC PRIJEVOZ I USLUGE',
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
            <p>LDCALUSIC PRIJEVOZ I USLUGE - Rezervacija Usluge</p>
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
            <p>📞 Telefon: 097 684 1992<br>
            📧 Email: ldcalusicprijevoziusluge@gmail.com</p>

            <div class="footer">
              <p><strong>LDCALUSIC PRIJEVOZ I USLUGE</strong><br>
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

// Send status update email when booking status changes
exports.sendStatusUpdateEmail = functions.firestore
  .document('bookings/{bookingId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();
    const bookingId = context.params.bookingId;

    // Only send email if status changed
    if (newData.status === oldData.status) {
      return null;
    }

    const statusMessages = {
      'pending': {
        subject: 'Vaša rezervacija je zaprimljena',
        message: 'Vaša rezervacija je zaprimljena i trenutno je u obradi. Kontaktirat ćemo vas uskoro.'
      },
      'confirmed': {
        subject: 'Rezervacija potvrđena',
        message: 'Vaša rezervacija je potvrđena! Radujemo se pružanju usluge.'
      },
      'completed': {
        subject: 'Usluga završena - Hvala vam!',
        message: 'Vaša usluga je uspješno završena. Hvala vam što ste odabrali LDCALUSIC PRIJEVOZ I USLUGE! Nadamo se da ste zadovoljni našom uslugom i veselimo se budućoj suradnji.'
      },
      'cancelled': {
        subject: 'Rezervacija otkazana',
        message: 'Vaša rezervacija je otkazana. Ako imate pitanja, kontaktirajte nas.'
      }
    };

    const statusInfo = statusMessages[newData.status];
    if (!statusInfo) return null;

    const mailOptions = {
      from: 'LDCALUSIC PRIJEVOZ I USLUGE <ldcalusicprijevoziusluge@gmail.com>',
      to: newData.email,
      subject: statusInfo.subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e5ba8, #5ba8e5); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f5f5f5; padding: 30px; border-radius: 0 0 10px 10px; }
            .status-badge { display: inline-block; padding: 8px 20px; border-radius: 20px; font-weight: 600; margin: 20px 0; }
            .status-confirmed { background: #d4edda; color: #155724; }
            .status-completed { background: #d1ecf1; color: #0c5460; }
            .status-cancelled { background: #f8d7da; color: #721c24; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Ažuriranje Rezervacije</h1>
              <p>LDCALUSIC PRIJEVOZ I USLUGE</p>
            </div>
            <div class="content">
              <h2>${statusInfo.subject}</h2>
              <p>${statusInfo.message}</p>

              <div class="booking-details">
                <span class="status-badge status-${newData.status}">
                  Status: ${newData.status.toUpperCase()}
                </span>
              </div>

              <p><strong>Broj rezervacije:</strong> #${bookingId.substring(0, 8).toUpperCase()}</p>
              <p><strong>Usluga:</strong> ${getServiceName(newData.service)}</p>
              <p><strong>Datum:</strong> ${newData.date} u ${newData.time}</p>

              <p>Ako imate bilo kakvih pitanja, slobodno nas kontaktirajte:</p>
              <p>📞 Telefon: 097 684 1992<br>
              📧 Email: ldcalusicprijevoziusluge@gmail.com</p>

              <div class="footer">
                <p><strong>LDCALUSIC PRIJEVOZ I USLUGE</strong><br>
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
      console.log(`Status update email sent for booking ${bookingId}`);
      return null;
    } catch (error) {
      console.error('Error sending status update email:', error);
      return null;
    }
  });
