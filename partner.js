import {showDeliveryProof} from './delivery-proof-view.mjs';
import {createPartnerWorkspace} from './partner-workspace.mjs?v=3';
import {attachAddressChecks} from './partner-addresses.mjs?v=loading-1';
import {auth,functions,httpsCallable,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut} from './firebase-config.js?v=loading-1';
import {sendPasswordReset} from './firebase-auth.js?v=loading-1';
const api=httpsCallable(functions,'partnerPortal'),$=id=>document.getElementById(id);let registering=false,requestId=crypto.randomUUID(),epoch=0;
const workspace=createPartnerWorkspace({openProof:id=>showDeliveryProof(httpsCallable(functions,'driverPortal'),id)});
const message=text=>{const el=$('feedback');el.hidden=false;el.textContent=text;};
const errors=e=>({'auth/invalid-credential':'Email ili lozinka nisu ispravni.','auth/email-already-in-use':'Račun već postoji. Prijavite se ili resetirajte lozinku.','auth/weak-password':'Odaberite jaču lozinku.','auth/too-many-requests':'Previše pokušaja. Pričekajte pa pokušajte ponovno.'}[e.code]||e.message||'Zahtjev nije uspio.');
async function run(form,task){const b=form.querySelector('button[type="submit"],button.primary');if(b.disabled)return;b.disabled=true;try{await task();}catch(e){message(errors(e));}finally{b.disabled=false;}}
async function profile(){const version=++epoch;const signed=!!auth.currentUser;$('authPanel').hidden=signed;$('logout').hidden=!signed;$('portal').hidden=true;$('accessPanel').hidden=true;document.body.classList.remove('workspace-active');if(!signed){workspace.clear();return;}try{const {data}=await api({action:'profile'});if(version!==epoch)return;const p=data.profile;if(p?.active){$('portal').hidden=false;document.body.classList.add('workspace-active');workspace.open();$('storeName').textContent='JYSK / '+p.store;await orders();}else{$('accessPanel').hidden=false;$('accessForm').hidden=!!p;$('accessMessage').textContent=p?'Zahtjev je zaprimljen. LD Čalušić mora odobriti pristup. Ako je pristup ranije bio aktivan, obratite se administratoru.':'Dopunite podatke kako bi LD Čalušić mogao odobriti vaš pristup.';}}catch(e){message(errors(e));}}
onAuthStateChanged(auth,()=>{if(!registering)profile();});
$('loginForm').addEventListener('submit',e=>{e.preventDefault();run(e.currentTarget,async()=>{const d=Object.fromEntries(new FormData(e.target));await signInWithEmailAndPassword(auth,d.email.trim(),d.password);});});
$('registerForm').addEventListener('submit',e=>{e.preventDefault();run(e.currentTarget,async()=>{const d=Object.fromEntries(new FormData(e.target));registering=true;try{await createUserWithEmailAndPassword(auth,d.email.trim(),d.password);await api({action:'requestAccess',name:d.name,store:d.store,phone:d.phone});}finally{registering=false;await profile();}});});
$('accessForm').addEventListener('submit',e=>{e.preventDefault();run(e.currentTarget,async()=>{await api({action:'requestAccess',...Object.fromEntries(new FormData(e.target))});await profile();});});
$('checkAccess').onclick=profile;$('logout').onclick=async()=>{await signOut(auth);$('feedback').hidden=true;};
$('reset').onclick=async()=>{const email=await notify.input('Unesite email svojeg računa.','',{type:'email',title:'Nova lozinka'});if(!email)return;const r=await sendPasswordReset(email.trim());message(r.success?'Provjerite email i neželjenu poštu za poveznicu za novu lozinku.':r.message);};
const orderForm=$('orderForm');const addressChecks=attachAddressChecks(orderForm);orderForm.elements.appointmentType.onchange=()=>{const flexible=orderForm.elements.appointmentType.value==='flexible';orderForm.elements.requestedDate.required=!flexible;if(flexible){orderForm.elements.requestedDate.value='';orderForm.elements.requestedTime.value='';}};
orderForm.addEventListener('submit',e=>{e.preventDefault();if(!addressChecks.validate())return;run(orderForm,async()=>{const d=Object.fromEntries(new FormData(orderForm));await api({action:'submit',...d,requestId});requestId=crypto.randomUUID();orderForm.reset();orderForm.elements.requestedDate.required=false;notify.success('Zahtjev je poslan LD Čalušiću. Raspored možete pratiti u svojim zahtjevima.');await orders();workspace.show('deliveries');});});
async function orders(){const version=epoch;const {data}=await api({action:'orders'});if(version!==epoch||!auth.currentUser)return;workspace.update(data.orders);}
$('refreshOrders').onclick=()=>orders().catch(e=>message(errors(e)));

setInterval(()=>{if(auth.currentUser&&!document.hidden&&!$('portal').hidden)orders().catch(()=>{});},60000);
