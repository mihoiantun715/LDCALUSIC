function validateDate(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||new Date(value+'T12:00:00Z').toISOString().slice(0,10)!==value)throw Error('Odaberite valjan datum.');return value;}
function tourKey(date,slot){validateDate(date);if(!Number.isInteger(slot)||slot<1||slot>100)throw Error('Odaberite broj ture od 1 do 100.');return date+'_'+slot;}
function eta(minutes,now=Date.now()){if(!Number.isInteger(minutes)||minutes<1||minutes>720)throw Error('Procjena mora biti od 1 do 720 minuta.');return now+minutes*60000;}
function checkTransition(status,action){if(action==='start'&&!['confirmed','in_transit'].includes(status))throw Error('Dostava mora biti prihvaćena prije polaska.');if(action==='complete'&&status!=='in_transit')throw Error('Najprije pokrenite dostavu.');}
function createDriverHandler({admin,functions}){return async(data,context)=>{
 const fail=(code,msg)=>{throw new functions.https.HttpsError(code,msg);};if(!context.auth)fail('unauthenticated','Prijavite se.');const uid=context.auth.uid,db=admin.firestore(),stamp=()=>admin.firestore.FieldValue.serverTimestamp();data=data||{};
 async function isAdmin(){return (await db.collection('admins').doc(uid).get()).data()?.role==='admin';}
 const driverRef=db.collection('drivers').doc(uid);
 if(data.action==='request'){const user=await admin.auth().getUser(uid);const name=String(data.name||'').trim().slice(0,120);if(!name)fail('invalid-argument','Unesite ime dostavljača.');await db.runTransaction(async tx=>{const s=await tx.get(driverRef);if(!s.exists)tx.set(driverRef,{name,email:user.email||'',active:false,createdAt:stamp()});});return {success:true};}
 if(data.action==='profile'){const s=await driverRef.get();return {profile:s.exists?s.data():null};}
 if(['members','access','assign','assignments'].includes(data.action)){
  if(!await isAdmin())fail('permission-denied','Samo administrator upravlja dostavljačima.');
  if(data.action==='members'){const s=await db.collection('drivers').get();return {members:s.docs.map(d=>({uid:d.id,name:d.data().name,email:d.data().email,active:d.data().active===true}))};}
  if(data.action==='access'){if(typeof data.uid!=='string'||data.uid.includes('/')||typeof data.active!=='boolean')fail('invalid-argument','Neispravan račun.');await db.collection('drivers').doc(data.uid).update({active:data.active,updatedBy:uid,updatedAt:stamp()});return {success:true};}
  let date;try{date=validateDate(data.date);}catch(e){fail('invalid-argument',e.message);}
  if(data.action==='assignments'){const plans=await db.collection('bookings').where('routePlanDate','==',date).get();const counts={};for(const d of plans.docs){const b=d.data();if(b.bookingType==='destination'||['cancelled','completed'].includes(b.status))continue;if(b.date!==date||!Number.isInteger(b.routeDriver))continue;counts[b.routeDriver]=(counts[b.routeDriver]||0)+1;}const assignments=await db.collection('driverTours').where('date','==',date).get();return {slots:Object.entries(counts).map(([slot,count])=>({slot:Number(slot),count})),assignments:assignments.docs.map(d=>({slot:d.data().slot,uid:d.data().uid}))};}
  let key;try{key=tourKey(date,data.slot);}catch(e){fail('invalid-argument',e.message);}if(typeof data.uid!=='string'||data.uid.includes('/'))fail('invalid-argument','Odaberite dostavljača.');
  await db.runTransaction(async tx=>{if(data.uid){const member=await tx.get(db.collection('drivers').doc(data.uid));if(!member.data()?.active)fail('failed-precondition','Dostavljač nije aktivan.');}tx.set(db.collection('driverTours').doc(key),{date,slot:data.slot,uid:data.uid,assignedBy:uid,updatedAt:stamp()});});return {success:true};
 }
 if(!(await driverRef.get()).data()?.active)fail('permission-denied','Administrator mora odobriti vaš dostavljački račun.');
 if(data.action==='jobs'){
 let date;try{date=validateDate(data.date);}catch(e){fail('invalid-argument',e.message);}const assignments=await db.collection('driverTours').where('uid','==',uid).get();const slots=new Set(assignments.docs.map(d=>d.data()).filter(t=>t.date===date).map(t=>t.slot));if(!slots.size)return {jobs:[]};const s=await db.collection('bookings').where('routePlanDate','==',date).get();const all=new Map(s.docs.map(d=>[d.id,{id:d.id,...d.data()}]));const jobs=[];
 for(const b of all.values()){if(b.date!==date||!slots.has(b.routeDriver)||b.bookingType==='destination'||b.status==='cancelled')continue;let from=b.from||b.location||'',to=b.to||b.location||'';if(b.bookingType==='origin'){const dest=all.get(b.originalBookingId);if(!dest||dest.originalBookingId!==b.id||dest.routeDriver!==b.routeDriver||dest.date!==date)continue;to=dest.location||dest.from;}
 jobs.push({id:b.id,name:b.name||'Kupac',phone:b.phone||'',from,to,time:b.time||'',date,slot:b.routeDriver,position:Number.isInteger(b.position)?b.position:99999,status:b.status,description:b.serviceDescription||'',handling:b.handlingSummary||'',notes:b.notes||'',orderNumber:b.orderNumber||'',etaAt:b.etaAt||null});}jobs.sort((a,b)=>a.slot-b.slot||a.position-b.position||a.time.localeCompare(b.time));return {jobs};
 }
 if(['start','complete'].includes(data.action)){
 if(typeof data.id!=='string'||!data.id||data.id.includes('/'))fail('invalid-argument','Neispravna dostava.');let etaAt=null;if(data.action==='start')try{etaAt=eta(data.minutes);}catch(e){fail('invalid-argument',e.message);}
 await db.runTransaction(async tx=>{const active=await tx.get(driverRef);if(!active.data()?.active)fail('permission-denied','Pristup je deaktiviran.');const ref=db.collection('bookings').doc(data.id),s=await tx.get(ref),b=s.data();if(!b||b.bookingType==='destination')fail('not-found','Dostava nije pronađena.');let key;try{key=tourKey(b.routePlanDate,b.routeDriver);}catch{fail('permission-denied','Dostava nema spremljenu turu.');}const tour=await tx.get(db.collection('driverTours').doc(key));if(tour.data()?.uid!==uid||b.date!==b.routePlanDate)fail('permission-denied','Ova tura nije dodijeljena vama.');try{checkTransition(b.status,data.action);}catch(e){fail('failed-precondition',e.message);}let paired=null;if(b.bookingType==='origin'){paired=db.collection('bookings').doc(b.originalBookingId);const mate=(await tx.get(paired)).data();if(!mate||mate.originalBookingId!==data.id||mate.routeDriver!==b.routeDriver||mate.routePlanDate!==b.routePlanDate||mate.status!==b.status)fail('failed-precondition','Preuzimanje i dostava nisu usklađeni.');}
 const update={status:data.action==='start'?'in_transit':'completed',statusUpdatedAt:stamp(),driverUpdatedBy:uid,...(etaAt?{etaAt}:{completedAt:stamp()})};tx.update(ref,update);if(paired)tx.update(paired,update);
 });return {success:true,etaAt};
 }
 fail('invalid-argument','Nepoznata radnja.');
};}
module.exports={createDriverHandler,tourKey,eta,checkTransition,validateDate};
