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
    if (booking.bookingType === 'destination') return null;
    const bookingId = context.params.bookingId;

    // Resolve the linked delivery for a complete route in notification emails.
    if(booking.bookingType==='origin'&&booking.originalBookingId){
      const destination=await admin.firestore().collection('bookings').doc(booking.originalBookingId).get();
      if(destination.exists)booking.to=destination.data().location||destination.data().from||'';
    }
    await require('./booking-notifications').sendBookingEmails(booking,bookingId,mail=>transporter.sendMail(mail));
    return null;
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
  const email=String(data.email||'').trim().toLowerCase(),code=String(data.code||'');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||!/^\d{6}$/.test(code))throw new functions.https.HttpsError('invalid-argument','Unesite valjan email i kod.');
  const crypto=require('node:crypto');
  const verificationRef=admin.firestore().collection('booking_verifications').doc(crypto.createHash('sha256').update(email).digest('hex'));
  await admin.firestore().runTransaction(async tx=>{
    const old=await tx.get(verificationRef);
    if(old.exists&&Date.now()-old.data().sentAt<30000)throw new functions.https.HttpsError('resource-exhausted','Pričekajte 30 sekundi prije ponovnog slanja koda.');
    tx.set(verificationRef,{hash:crypto.createHash('sha256').update(code).digest('hex'),sentAt:Date.now(),expiresAt:Date.now()+15*60*1000,ready:false,attempts:0});
  });

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
    await verificationRef.update({ready:true});
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

    await require('./status-notifications').sendStatusEmails(oldData,newData,bookingId,mail=>transporter.sendMail(mail));
    return null;
  });

// Public submissions are validated on the server; guests never gain database write access.
exports.submitPublicBooking = functions.https.onCall(async (data,context)=>{
 const {validatePublicBooking}=require('./public-booking');
 let booking;try{booking=validatePublicBooking(data);}catch(error){throw new functions.https.HttpsError('invalid-argument',error.message);}
 const crypto=require('node:crypto'),db=admin.firestore();
 const ref=db.collection('booking_verifications').doc(crypto.createHash('sha256').update(booking.email).digest('hex'));
 const origin=db.collection('bookings').doc(),destination=db.collection('bookings').doc();
 const result=await db.runTransaction(async tx=>{
   const snap=await tx.get(ref),v=snap.data();
   if(!v||!v.ready||v.expiresAt<Date.now())return {error:'Kod je istekao. Zatražite novi kod za email.'};
   if(v.attempts>=5)return {error:'Previše pokušaja. Zatražite novi kod.'};
   if(v.hash!==crypto.createHash('sha256').update(String(data.verificationCode||'')).digest('hex')){tx.update(ref,{attempts:v.attempts+1});return {error:'Verifikacijski kod nije ispravan.'};}
   if(v.requestId===data.requestId&&v.bookingId)return {bookingId:v.bookingId};
   if(v.bookingId)return {error:'Kod je već iskorišten. Zatražite novi kod za novu rezervaciju.'};
   const base={...booking,userId:context.auth?.uid||null,status:'pending',createdAt:admin.firestore.FieldValue.serverTimestamp(),position:null};
   if(booking.service==='transport'){
    tx.set(origin,{...base,bookingType:'origin',location:booking.from,locationLabel:'Polazište',to:'',originalBookingId:destination.id});
    tx.set(destination,{...base,bookingType:'destination',location:booking.to,locationLabel:'Odredište',from:booking.to,to:'',originalBookingId:origin.id});
   }else tx.set(origin,base);
   tx.update(ref,{bookingId:origin.id,requestId:data.requestId});return {bookingId:origin.id};
 });
 if(result.error)throw new functions.https.HttpsError('failed-precondition',result.error);
 return {success:true,...result};
});

exports.partnerPortal = functions.https.onCall(require('./partner-portal').createPartnerHandler({admin,functions}));

exports.driverPortal = functions.https.onCall(require('./driver-portal').createDriverHandler({admin,functions}));

exports.driverAssignmentPush=functions.runWith({secrets:['DRIVER_PUSH_PRIVATE']}).firestore.document('driverTours/{id}').onWrite(change=>require('./driver-push').assignmentPush(admin,change));
exports.driverBookingPush=functions.runWith({secrets:['DRIVER_PUSH_PRIVATE']}).firestore.document('bookings/{id}').onWrite(change=>require('./driver-push').bookingPush(admin,change));
exports.driverTourFinishedEmail=functions.runWith({failurePolicy:true}).firestore.document('tourCompletions/{id}').onCreate(async snapshot=>{const current=(await snapshot.ref.get()).data();const messages=require('./tour-finish').finishEmails(current);for(const mail of messages){const key=require('crypto').createHash('sha256').update(mail.to).digest('hex');if(current.sent?.[key])continue;await transporter.sendMail(mail);await snapshot.ref.update({['sent.'+key]:admin.firestore.FieldValue.serverTimestamp()});}});
