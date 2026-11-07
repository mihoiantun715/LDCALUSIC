import {serviceCatalog} from './booking-details.mjs';
export function driverJobDetails(job){
 const values=key=>[...new Set(job.docs.map(d=>String(d[key]??'').trim()).filter(Boolean))];
 return {phones:values('phone'),emails:values('email'),service:serviceCatalog[job.docs[0]?.service]?.name||job.docs[0]?.service||'Prijevoz',description:[...new Set([...values('serviceDescription'),...values('message')])].join('\n'),notes:values('notes').join('\n'),weight:values('approxWeight').map(v=>v+' kg').join(' / '),ids:job.docs.map(d=>d.id).join(', ')};
}
export function renderDriverPlan(doc,{date,dirty,groups,results=[],timeConflict=false}){
 doc.title='LD Čalušić — plan prijevoza '+date;
 doc.documentElement.lang='hr';
 const style=doc.createElement('style');style.textContent=`
 @page{size:A4;margin:15mm}*{box-sizing:border-box}body{font:12px/1.5 Arial,sans-serif;color:#173757;margin:24px auto;max-width:900px;padding:0 16px}h1{font-size:23px;margin:0}h2{font-size:19px;margin:22px 0 8px}h3{font-size:16px;margin:0}.masthead{border-bottom:3px solid #175ec8;padding-bottom:12px}.muted{color:#53677a}.notice{border:1px solid #98aec5;padding:8px}.job{border:1px solid #c9d7e6;border-radius:8px;padding:14px;margin:12px 0;break-inside:avoid;page-break-inside:avoid}.row{display:grid;grid-template-columns:145px 1fr;gap:10px;margin:7px 0;white-space:pre-wrap;overflow-wrap:anywhere}.phone{font-size:17px;font-weight:bold;color:#104c92}a{color:inherit;text-decoration:none}.notes{border-top:1px solid #c9d7e6;margin-top:12px;padding-top:8px;min-height:54px}.driver+ .driver{break-before:page;page-break-before:always}footer{margin-top:20px;font-size:11px;border-top:1px solid #c9d7e6;padding-top:8px}@media print{body{margin:0;max-width:none;padding:0}.toolbar{display:none}a{color:#173757}}`;
 doc.head.append(style);doc.body.replaceChildren();
 const add=(parent,tag,text,cls)=>{const n=doc.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;parent.append(n);return n;};
 const toolbar=add(doc.body,'div',null,'toolbar');const print=add(toolbar,'button','Ispiši / spremi PDF');print.onclick=()=>doc.defaultView.print();
 const row=(parent,label,value,cls)=>{const r=add(parent,'div',null,'row');add(r,'strong',label);return add(r,'div',value||'Nije navedeno',cls);};
 for(const group of groups){
 const section=add(doc.body,'section',null,'driver'),header=add(section,'header',null,'masthead');
 add(header,'h1','LD Čalušić — radni nalog vozača');add(header,'p',date.split('-').reverse().join('.')+'. · Vozač '+group.id);
 add(header,'p',dirty?'NACRT — promjene nisu spremljene':'Spremljeni raspored','muted');
 add(header,'p','Kontakt tvrtke: +385 97 684 1992 · Dostupni 0–24','muted');
 const ids=new Set(group.jobs.map(j=>j.id));const calculation=results.find(r=>r.stops.length===group.jobs.reduce((n,j)=>n+j.stops.length,0)&&r.stops.every(s=>ids.has(s.jobId)));
 add(section,'p',group.jobs.length+' poslova · '+group.jobs.reduce((n,j)=>n+j.stops.length,0)+' stajanja');
 add(section,'p',calculation?`Ukupna vožnja: ${(calculation.distance/1000).toLocaleString('hr-HR',{maximumFractionDigits:1})} km · ${Math.ceil(calculation.duration/60)} min. Bez utovara, istovara, odmora i polaska/povratka u bazu.`:'Udaljenost i trajanje nisu izračunati. Za prikaz najprije odaberite „Izračunaj put”.','muted');
 if(timeConflict)add(section,'p','Provjerite termine s klijentima: ručni redoslijed odstupa od dogovorenih vremena.','notice');
 group.jobs.forEach((job,i)=>{const details=driverJobDetails(job),card=add(section,'article',null,'job');
 add(card,'h3',`${i+1}. ${job.name}`);row(card,'Dogovoreni termin',job.time||'Po dogovoru');
 const phone=row(card,'Telefon klijenta',details.phones.length?'': 'Broj nije naveden — provjerite s uredom','phone');
 if(details.phones.length){phone.textContent='';details.phones.forEach((value,index)=>{if(index)add(phone,'br');const link=add(phone,'a',value);const dial=value.replace(/[^\d+]/g,'');if(/^\+?\d{6,15}$/.test(dial))link.href='tel:'+dial;});}
 if(details.emails.length)row(card,'Email klijenta',details.emails.join('\n'));
 row(card,'Usluga',details.service);
 if(job.docs[0]?.source==='partner'){const b=job.docs[0];row(card,'Partner / narudžba','JYSK · '+(b.partnerStore||'')+' · '+(b.orderNumber||'—'));row(card,'Kontakt trgovine',(b.partnerContact||'')+' '+(b.partnerPhone||''));}
 job.stops.forEach((address,index)=>row(card,job.stops.length===1?'Lokacija':index===0?'Preuzimanje':'Dostava',address));
 row(card,'Opis / teret',details.description||'Dodatni opis nije naveden');
 if(details.weight)row(card,'Približna težina',details.weight);
 row(card,'Napomene klijenta',details.notes||'Nema dodatnih napomena');
 row(card,'Broj rezervacije',details.ids);
 add(card,'div','Bilješke vozača / vrijeme preuzimanja i dostave:\n\n____________________________________________________________','notes');
 });
 add(section,'footer','Prije polaska provjeriti kontakt i pristup lokaciji. Vrijeme ispisa: '+new Intl.DateTimeFormat('hr-HR',{dateStyle:'short',timeStyle:'short',timeZone:'Europe/Zagreb'}).format(new Date()));
 }
}
