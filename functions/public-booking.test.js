const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {validatePublicBooking}=require('./public-booking');
const sample={name:'Test',email:'test@example.com',phone:'+385976841992',service:'transport',from:'Brod',to:'Osijek',date:'2099-12-01',time:'10:00',message:'Kutije',verificationCode:'123456',requestId:'12345678-1234-1234-1234-123456789012'};
test('validates and allowlists public fields',()=>{const b=validatePublicBooking({...sample,status:'confirmed',userId:'admin'});assert.equal(b.status,undefined);assert.equal(b.userId,undefined);assert.equal(b.serviceCategory,'transport');for(const change of [{to:''},{email:'bad'},{date:'2099-02-30'},{service:'admin'},{phone:'x'},{message:'x'.repeat(5001)}])assert.throws(()=>validatePublicBooking({...sample,...change}));});
test('public booking verifies code, commits paired records atomically and deduplicates retries',async()=>{
 let records=new Map(),seq=0;const ref=path=>({path,id:path.split('/').at(-1),update:async data=>records.set(path,{...records.get(path),...data})});
 const db={collection:name=>({doc:id=>ref(name+'/'+(id||'id'+(++seq)))}),runTransaction:async fn=>{const draft=new Map(records),tx={get:async r=>({exists:draft.has(r.path),data:()=>draft.get(r.path)}),set:(r,d)=>draft.set(r.path,d),update:(r,d)=>draft.set(r.path,{...draft.get(r.path),...d})};const result=await fn(tx);records=draft;return result;}};
 const firestore=()=>db;firestore.FieldValue={serverTimestamp:()=>123};
 const functions={https:{onCall:fn=>fn,HttpsError:class extends Error{constructor(code,message){super(message);this.code=code;}}},firestore:{document:()=>({onCreate:fn=>fn,onUpdate:fn=>fn})}};
 const exports={};vm.runInNewContext(fs.readFileSync(__dirname+'/index.js','utf8'),{exports,console,require:name=>name==='firebase-functions'?functions:name==='firebase-admin'?{initializeApp(){},firestore}:name==='nodemailer'?{createTransport:()=>({sendMail:async()=>{}})}:require(name)});
 await assert.rejects(exports.submitPublicBooking(sample,{}),/Kod je istekao/);
 await exports.sendVerificationCode({email:sample.email,code:sample.verificationCode},{});
 await assert.rejects(exports.submitPublicBooking({...sample,verificationCode:'999999'},{}),/nije ispravan/);
 const one=await exports.submitPublicBooking(sample,{}),two=await exports.submitPublicBooking(sample,{});assert.equal(one.bookingId,two.bookingId);
 const bookings=[...records].filter(([k])=>k.startsWith('bookings/'));assert.equal(bookings.length,2);const origin=bookings.find(([,v])=>v.bookingType==='origin'),dest=bookings.find(([,v])=>v.bookingType==='destination');assert.equal(origin[1].originalBookingId,dest[0].split('/')[1]);assert.equal(dest[1].originalBookingId,origin[0].split('/')[1]);assert.equal(origin[1].status,'pending');assert.equal(origin[1].userId,null);
 await assert.rejects(exports.submitPublicBooking({...sample,requestId:'aaaaaaaa-1234-1234-1234-123456789012'},{}),/već iskorišten/);
});
