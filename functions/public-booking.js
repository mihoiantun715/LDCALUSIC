function validatePublicBooking(data){
 if(!data||typeof data!=='object')throw Error('Nedostaju podaci rezervacije.');
 const limits={name:120,email:254,phone:40,service:30,from:500,to:500,date:10,time:5,message:5000};const b={};
 for(const [key,max] of Object.entries(limits)){if(data[key]!=null&&typeof data[key]!=='string')throw Error('Neispravno polje: '+key);b[key]=(data[key]||'').trim();if(b[key].length>max)throw Error('Predugačak unos: '+key);}
 b.email=b.email.toLowerCase();
 if(!b.name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)||!/^\+?[\d\s()-]{7,40}$/.test(b.phone))throw Error('Provjerite ime, email i telefon.');
 if(!['transport','cleaning','garden','special'].includes(b.service)||!b.from||(b.service==='transport'&&!b.to))throw Error('Odaberite uslugu i unesite potrebne adrese.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(b.date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(b.time)||!Number.isFinite(Date.parse(b.date))||new Date(b.date).toISOString().slice(0,10)!==b.date)throw Error('Odaberite valjan datum i vrijeme.');
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zagreb',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 if(b.date<today)throw Error('Datum rezervacije ne može biti u prošlosti.');
 if(typeof data.requestId!=='string'||! /^[a-zA-Z0-9-]{20,64}$/.test(data.requestId)||!/^\d{6}$/.test(String(data.verificationCode||'')))throw Error('Ponovite potvrdu email koda.');
 return {...b,serviceCategory:b.service};
}
module.exports={validatePublicBooking};
