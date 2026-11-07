const templates=require('./email-templates');
const COMPANY_EMAIL='ldcalusicprijevoziusluge@gmail.com';
function bookingEmails(b,id){
 if(b.bookingType==='destination')return [];
 const partner=b.source==='partner'&&b.partnerId==='jysk';
 const messages=[{from:'LD Čalušić <'+COMPANY_EMAIL+'>',to:COMPANY_EMAIL,subject:partner?'Novi zahtjev od JYSK-a'+(b.partnerStore?' — '+b.partnerStore:''):'Nova rezervacija na web stranici — LD Čalušić',...templates.booking(b,id,true)}];
 if(b.email)messages.push({from:'LD Čalušić <'+COMPANY_EMAIL+'>',to:b.email,subject:'Zaprimili smo vaš zahtjev — LD Čalušić',...templates.booking(b,id)});
 return messages;
}
async function sendBookingEmails(booking,id,sendMail,logger=console){
 const messages=bookingEmails(booking,id);
 const results=await Promise.allSettled(messages.map(mail=>sendMail(mail)));
 results.forEach((r,i)=>{if(r.status==='rejected')logger.error('Booking notification failed',{bookingId:id,channel:i===0?'company':'customer',code:r.reason?.code||'SEND_FAILED'});});
 return results.map(r=>r.status);
}
module.exports={bookingEmails,sendBookingEmails,COMPANY_EMAIL};
