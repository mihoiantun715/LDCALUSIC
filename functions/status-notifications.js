const templates=require('./email-templates');const {COMPANY_EMAIL}=require('./booking-notifications');
function statusEmails(before,b,id){
 if(b.bookingType==='destination')return [];
 const changed=b.status!==before.status,scheduled=b.source==='partner'&&(b.date!==before.date||b.time!==before.time||b.routePlanDate!==before.routePlanDate);
 if(!changed&&!scheduled)return [];
 const states={pending:{subject:'Zahtjev je zaprimljen',message:'Zahtjev je zaprimljen i čeka obradu.'},confirmed:{subject:'Zahtjev je prihvaćen',message:'LD Čalušić prihvatio je zahtjev. Termin izvedbe prikazan je u detaljima; ako još nije naveden, naknadno ćemo ga dogovoriti.'},in_transit:{subject:'Dostava je krenula',message:'LD Čalušić označio je da je dostava krenula prema kupcu.'},completed:{subject:'Dostava je završena',message:'LD Čalušić označio je dostavu kao završenu. Hvala na suradnji.'},cancelled:{subject:'Zahtjev je otkazan',message:'Zahtjev je otkazan. Za detalje se obratite LD Čalušiću.'}};
 const info=changed?states[b.status]:{subject:'Termin dostave je ažuriran',message:'LD Čalušić ažurirao je raspored dostave. Provjerite novi datum i vrijeme u detaljima.'};if(!info)return [];
 const recipients=[];if(b.source==='partner'&&b.partnerEmail)recipients.push({email:b.partnerEmail,partner:true});if(b.email&&!recipients.some(r=>r.email.toLowerCase()===b.email.toLowerCase()))recipients.push({email:b.email,partner:false});
 return recipients.map(r=>({from:'LD Čalušić <'+COMPANY_EMAIL+'>',to:r.email,subject:(r.partner?'JYSK · ':'')+info.subject,...(r.partner?templates.partnerStatus(b,id,info):templates.status(b,id,info))}));
}
async function sendStatusEmails(before,after,id,sendMail,logger=console){const messages=statusEmails(before,after,id);const result=await Promise.allSettled(messages.map(m=>sendMail(m)));result.forEach((r,i)=>{if(r.status==='rejected')logger.error('Status notification failed',{bookingId:id,index:i,code:r.reason?.code||'SEND_FAILED'});});return result;}
module.exports={statusEmails,sendStatusEmails};
