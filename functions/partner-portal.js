const text=(v,max=500)=>typeof v==='string'?v.trim().slice(0,max):'';
function validatePartnerOrder(data){
 const b={name:text(data.name,120),phone:text(data.phone,40),email:text(data.email,254).toLowerCase(),from:text(data.from),to:text(data.to),serviceDescription:text(data.serviceDescription,5000),notes:text(data.notes,5000),orderNumber:text(data.orderNumber,100),approxWeight:text(data.approxWeight,20),requestedDate:text(data.requestedDate,10),requestedTime:text(data.requestedTime,5),appointmentType:text(data.appointmentType,20)};
 if(!b.name||!/^\+?[\d\s()-]{7,40}$/.test(b.phone)||!b.from||!b.to||!b.serviceDescription)throw Error('Unesite ime, telefon, obje adrese i opis robe.');
 if(b.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email))throw Error('Email kupca nije valjan.');
 if(!['flexible','preferred','agreed'].includes(b.appointmentType))throw Error('Odaberite vrstu termina.');
 if(b.appointmentType!=='flexible'&&!b.requestedDate)throw Error('Unesite datum termina.');
 validateDate(b.requestedDate,b.requestedTime);
 if(b.approxWeight&&(!Number.isFinite(Number(b.approxWeight))||Number(b.approxWeight)<0))throw Error('Težina mora biti pozitivan broj.');
 return {...b,...require('./delivery-fields').handlingFields(data)};
}
function validateDate(date,time){
 if(date&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date))throw Error('Datum nije valjan.');
 if(time&&(!date||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)))throw Error('Vrijeme nije valjano.');
 if(date&&date<new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zagreb',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()))throw Error('Odaberite današnji ili budući datum.');
}
function createPartnerHandler({admin,functions}){return async(data,context)=>{
 const fail=(code,message)=>{throw new functions.https.HttpsError(code,message);};
 if(!context.auth)fail('unauthenticated','Prijavite se u svoj račun.');
 const db=admin.firestore(),uid=context.auth.uid,stamp=()=>admin.firestore.FieldValue.serverTimestamp(),memberRef=db.collection('partners').doc(uid),action=data?.action;
 const requireAdmin=async()=>{const a=await db.collection('admins').doc(uid).get();if(!a.exists||a.data().role!=='admin')fail('permission-denied','Samo administrator upravlja pristupom i rasporedom.');};
 if(action==='requestAccess'){
 const name=text(data.name,120),store=text(data.store,180),phone=text(data.phone,40);if(!name||!store||!phone)fail('invalid-argument','Unesite ime, poslovnicu i kontakt telefon.');
 const account=await admin.auth().getUser(uid);
 await db.runTransaction(async tx=>{const existing=await tx.get(memberRef);if(existing.exists)return;tx.set(memberRef,{name,store,phone,email:account.email||'',companyId:'jysk',active:false,createdAt:stamp()});});return {success:true};
 }
 if(action==='profile'){const snap=await memberRef.get();return {profile:snap.exists?{...snap.data(),id:uid}:null};}
 if(action==='members'){await requireAdmin();const docs=await db.collection('partners').get();return {members:docs.docs.map(d=>({...d.data(),id:d.id}))};}
 if(['editMember','removeMember','restoreMember'].includes(action)){
 await requireAdmin();if(typeof data.uid!=='string'||!data.uid||data.uid.includes('/'))fail('invalid-argument','Neispravan korisnik.');
 const ref=db.collection('partners').doc(data.uid);
 let patch;
 if(action==='editMember'){const name=text(data.name,120),store=text(data.store,180),phone=text(data.phone,40);if(!name||!store||!/^\+?[\d\s()-]{7,40}$/.test(phone))fail('invalid-argument','Unesite ime, poslovnicu i valjan telefon.');patch={name,store,phone};}
 else patch=action==='removeMember'?{deleted:true,active:false,deletedAt:stamp()}:{deleted:false,active:false};
 await db.runTransaction(async tx=>{const snap=await tx.get(ref);if(!snap.exists)fail('not-found','Suradnik nije pronađen.');if(action==='editMember'&&snap.data().deleted)fail('failed-precondition','Najprije vratite suradnika.');tx.update(ref,{...patch,updatedAt:stamp(),updatedBy:uid});});return {success:true};
 }
 if(action==='access'){
 await requireAdmin();if(typeof data.active!=='boolean'||typeof data.uid!=='string')fail('invalid-argument','Neispravan zahtjev.');
 const target=db.collection('partners').doc(data.uid);await db.runTransaction(async tx=>{const snap=await tx.get(target);if(!snap.exists)fail('not-found','Zahtjev nije pronađen.');if(snap.data().deleted)fail('failed-precondition','Najprije vratite obrisani pristup.');tx.update(target,{active:data.active,approvedBy:uid,updatedAt:stamp()});});return {success:true};
 }
 if(action==='schedule'){
 await requireAdmin();const date=text(data.date,10),time=text(data.time,5);try{validateDate(date,time);if(!date)throw Error('Odaberite datum.');}catch(e){fail('invalid-argument',e.message);}
 const ref=db.collection('bookings').doc(text(data.id,128));await db.runTransaction(async tx=>{const snap=await tx.get(ref),b=snap.data();if(!b||b.source!=='partner')fail('not-found','Partnerski zahtjev nije pronađen.');if(['cancelled','completed'].includes(b.status))fail('failed-precondition','Zatvoren zahtjev ne može se rasporediti.');tx.update(ref,{date,time,position:null,routePlanDate:null,routeDriver:null,scheduledBy:uid,updatedAt:stamp()});});return {success:true};
 }
 const member=await memberRef.get();if(!member.exists||!member.data().active||member.data().deleted||member.data().companyId!=='jysk')fail('permission-denied','Pristup još nije odobren ili je deaktiviran.');
 if(action==='orders'){const docs=await db.collection('bookings').where('partnerUserId','==',uid).get();return {orders:docs.docs.map(d=>{const b=d.data();return {id:d.id,name:b.name,phone:b.phone,from:b.from,to:b.to,orderNumber:b.orderNumber,status:b.status,date:b.date,time:b.time,requestedDate:b.requestedDate,requestedTime:b.requestedTime,appointmentType:b.appointmentType,hasProof:!!b.hasProof,plannedDate:b.routePlanDate||'',handlingSummary:b.handlingSummary||'',serviceDescription:b.serviceDescription||'',notes:b.notes||'',statusUpdatedAt:b.statusUpdatedAt?.toMillis()||0,createdAt:b.createdAt?.toMillis()||0};}).sort((a,b)=>b.createdAt-a.createdAt)};}
 if(action==='submit'){
 let b;try{b=validatePartnerOrder(data);}catch(e){fail('invalid-argument',e.message);}
 if(!/^[a-zA-Z0-9-]{20,64}$/.test(data.requestId||''))fail('invalid-argument','Osvježite obrazac.');
 const ref=db.collection('bookings').doc('partner_'+uid+'_'+data.requestId);
 await db.runTransaction(async tx=>{const access=await tx.get(memberRef),existing=await tx.get(ref);if(!access.data()?.active||access.data()?.deleted)fail('permission-denied','Pristup je deaktiviran.');if(existing.exists)return;const m=access.data();tx.set(ref,{...b,source:'partner',partnerId:'jysk',partnerName:'JYSK Hrvatska',partnerUserId:uid,partnerStore:m.store,partnerContact:m.name,partnerPhone:m.phone,partnerEmail:m.email,userId:null,service:'furniture_appliances',serviceCategory:'transport',status:'pending',date:b.appointmentType==='agreed'?b.requestedDate:'',time:b.appointmentType==='agreed'?b.requestedTime:'',position:null,createdAt:stamp()});});return {success:true,id:ref.id};
 }
 fail('invalid-argument','Nepoznata radnja.');
};}
module.exports={createPartnerHandler,validatePartnerOrder,validateDate};
