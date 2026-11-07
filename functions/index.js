const emailTemplates = require('./email-templates');
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
      subject: 'Zaprimili smo vaš zahtjev — LD Čalušić',
      ...emailTemplates.booking(booking, bookingId)
    };

    // Email to admin
    const adminMailOptions = {
      from: 'LDCALUSIC PRIJEVOZ I USLUGE <ldcalusicprijevoziusluge@gmail.com>',
      to: 'ldcalusicprijevoziusluge@gmail.com',
      subject: `Nova rezervacija - ${getServiceName(booking.service)}`,
      ...emailTemplates.booking(booking, bookingId, true)
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

// Send status update email when booking status changes
exports.sendStatusUpdateEmail = functions.firestore
  .document('bookings/{bookingId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();
    // Linked transport stops are updated together; send one customer notice.
    if (newData.bookingType === 'destination') return null;
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
      ...emailTemplates.status(newData, bookingId, statusInfo)
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
