// Pure planning rules. A transport job is indivisible: pickup always precedes delivery.
const transportCodes=new Set(['fitness','moving_eu','clearing','waste','transport','vehicle_transport','furniture_appliances','general_cargo','cargo','installation','furniture_assembly','fitness_equipment','general_transport','moving','space_clearing','waste_disposal','Prijevoz i Dostava sa Instalacijom']);
export const position=b=>Number.isInteger(b.position)&&b.position>=0?b.position:Number.MAX_SAFE_INTEGER;
export const signature=b=>JSON.stringify(['date','time','status','from','to','location','bookingType','originalBookingId','position','routeDriver','routePlanDate'].map(k=>b[k]??null));
export function buildJobs(records,date,status='all'){
 const byId=new Map(records.map(b=>[b.id,b])),seen=new Set(),jobs=[],issues=[];
 const candidates=records.filter(b=>b.date===date&&b.status!=='cancelled'&&(status==='all'?b.status!=='completed':b.status===status)&&(b.serviceCategory==='transport'||transportCodes.has(b.service)||transportCodes.has(b.serviceCategory)));
 for(const row of candidates){if(seen.has(row.id))continue;let docs=[row],stops=[];
 if(row.bookingType==='origin'||row.bookingType==='destination'){
 const mate=byId.get(row.originalBookingId);const origin=row.bookingType==='origin'?row:mate,dest=row.bookingType==='destination'?row:mate;
 if(!origin||!dest||origin.bookingType!=='origin'||dest.bookingType!=='destination'||origin.originalBookingId!==dest.id||dest.originalBookingId!==origin.id||origin.date!==dest.date||origin.status!==dest.status||origin.time!==dest.time){issues.push({id:row.id,message:'Nepotpuno ili neusklađeno preuzimanje i dostava — provjerite rezervaciju.'});seen.add(row.id);continue;}
 docs=[origin,dest];stops=[origin.location||origin.from,dest.location||dest.from];
 }else stops=[row.from,row.to].filter(v=>typeof v==='string'&&v.trim());
 docs.forEach(d=>seen.add(d.id));if(!stops.length||stops.some(s=>typeof s!=='string'||!s.trim())){issues.push({id:row.id,message:'Nedostaje adresa stajanja.'});continue;}
 const first=docs[0];jobs.push({id:first.id,docs,stops:stops.map(s=>s.trim()),date:first.date,time:first.time||'',name:first.name||first.email||'Klijent',driver:docs.every(d=>d.routeDriver===first.routeDriver)?(Number.isInteger(first.routeDriver)&&first.routeDriver>0?first.routeDriver:1):1,rank:Math.min(...docs.map(position))});
 }
 jobs.sort((a,b)=>a.rank-b.rank||(a.time||'99:99').localeCompare(b.time||'99:99')||a.id.localeCompare(b.id));return {jobs,issues};
}
export function stopsFor(jobs){return jobs.flatMap(j=>j.stops.map((address,i)=>({address,jobId:j.id,kind:j.stops.length===1?'Stajanje':i===0?'Preuzimanje':'Dostava',name:j.name,time:j.time})));}
export function chunks(stops,size=27){if(size<2)throw Error('Invalid chunk size');const result=[];for(let i=0;i<stops.length-1;i+=size-1)result.push(stops.slice(i,i+size));return result;}
export function moveJob(jobs,id,direction){const next=[...jobs],index=next.findIndex(j=>j.id===id),other=index+direction;if(index<0||other<0||other>=next.length)return next;[next[index],next[other]]=[next[other],next[index]];return next;}
export function splitDrivers(jobs,count){if(!Number.isInteger(count)||count<1||count>jobs.length)throw Error('Broj vozača mora biti cijeli broj od 1 do broja poslova.');let cursor=0;return Array.from({length:count},(_,i)=>{const size=Math.floor(jobs.length/count)+(i<jobs.length%count?1:0);return jobs.slice(cursor,cursor+=size).map(j=>({...j,driver:i+1}));}).flat();}
export function updatesFor(jobs,date){const ids=new Set();let rank=0;return jobs.flatMap(j=>j.docs.map(doc=>{if(ids.has(doc.id))throw Error('Dupla rezervacija u planu.');ids.add(doc.id);if(doc.date!==date||doc.status==='cancelled'||doc.status==='completed')throw Error('Plan sadrži rezervaciju koja se više ne može raspoređivati.');return {id:doc.id,before:signature(doc),data:{position:rank++,routeDriver:j.driver,routePlanDate:date}};}));}
export function swapCandidates(jobs){const options=[];for(let i=1;i<jobs.length-1;i++){if(jobs[i].time===jobs[i+1].time){const copy=[...jobs];[copy[i],copy[i+1]]=[copy[i+1],copy[i]];options.push(copy);}}return options.slice(0,5);}

export function hasTimeConflict(jobs){
 const latest=new Map();
 for(const job of jobs){if(!job.time)continue;const driver=job.driver||1;if(latest.has(driver)&&job.time<latest.get(driver))return true;latest.set(driver,job.time);}
 return false;
}
