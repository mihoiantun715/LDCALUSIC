export const serviceCatalog={
  "vehicle_transport": {
    "name": "Prijevoz motornih vozila",
    "description": "Transport automobila, motocikala i drugih vozila"
  },
  "furniture_appliances": {
    "name": "Namještaj i kućanski aparati",
    "description": "Dostava namještaja i kućanskih aparata"
  },
  "cargo": {
    "name": "Paletirana i rasuti teret",
    "description": "Transport paletiranog i rasutog tereta"
  },
  "installation": {
    "name": "Instalacija i deinstalacija aparata",
    "description": "Ugradnja i odvoz starih kućanskih aparata"
  },
  "furniture_assembly": {
    "name": "Dostava i ugradnja namještaja",
    "description": "Sastavljanje manjih kuhinja i namještaja"
  },
  "fitness": {
    "name": "Fitness aparati",
    "description": "Dostava i sastavljanje fitness opreme"
  },
  "general_cargo": {
    "name": "Transport robe po RH",
    "description": "Sve vrste neopasnog tereta diljem Hrvatske"
  },
  "moving_eu": {
    "name": "Selidbe po EU",
    "description": "Međunarodne selidbe po cijeloj Europi"
  },
  "clearing": {
    "name": "Pražnjenje prostora",
    "description": "Pražnjenje poslovnih i stambenih prostora"
  },
  "waste": {
    "name": "Odvoz otpada",
    "description": "Odvoz starih aparata i neopasnog otpada"
  },
  "general_cleaning": {
    "name": "Opće čišćenje prostora",
    "description": "Osnovno čišćenje prostorija"
  },
  "regular_cleaning": {
    "name": "Redovito čišćenje",
    "description": "Redovito čišćenje uredskih i stambenih prostora"
  },
  "deep_cleaning": {
    "name": "Dubinsko čišćenje",
    "description": "Generalno čišćenje nakon renovacije ili selidbe"
  },
  "floor_cleaning": {
    "name": "Čišćenje podova",
    "description": "Usisavanje, pranje i poliranje podova"
  },
  "disinfection": {
    "name": "Dezinfekcija",
    "description": "Dezinfekcija sanitarnih čvorova i kuhinja"
  },
  "window_washing": {
    "name": "Pranje prozora",
    "description": "Pranje unutarnjih i vanjskih stakala"
  },
  "glass_surfaces": {
    "name": "Čišćenje staklenih površina",
    "description": "Izlozi, staklena vrata i fasade"
  },
  "balcony_glass": {
    "name": "Balkonske ograde",
    "description": "Pranje staklenih fasada i balkonskih ograda"
  },
  "stain_removal": {
    "name": "Uklanjanje tvrdokornih mrlja",
    "description": "Vapno, cement, ljepilo sa stakla"
  },
  "frames_shutters": {
    "name": "Okviri i rolete",
    "description": "Čišćenje okvira, roleta i prozorskih klupica"
  },
  "lawn_mowing": {
    "name": "Košnja travnjaka",
    "description": "Redovno održavanje travnjaka"
  },
  "tree_trimming": {
    "name": "Rezidba stabala",
    "description": "Rezidba i sanacija stabala"
  },
  "hedge_trimming": {
    "name": "Formiranje živica",
    "description": "Rezidba i formiranje živica i grmova"
  },
  "planting": {
    "name": "Sadnja bilja",
    "description": "Sadnja cvijeća i ukrasnog bilja"
  },
  "commercial_cleaning": {
    "name": "Čišćenje poslovnih objekata",
    "description": "Čišćenje poslovnih objekata i industrijskih hala"
  },
  "construction_cleanup": {
    "name": "Čišćenje nakon građevinskih radova",
    "description": "Profesionalno čišćenje nakon renovacije i gradnje"
  },
  "common_areas": {
    "name": "Zajednički prostori u zgradama",
    "description": "Čišćenje i dezinfekcija zajedničkih prostora"
  },
  "outdoor_cleaning": {
    "name": "Čišćenje vanjskih površina",
    "description": "Dvorišta, prilazi i vanjski prostori"
  },
  "event_cleaning": {
    "name": "Održavanje čistoće na događanjima",
    "description": "Čišćenje prije, tijekom i nakon događaja"
  },
  "fitness_equipment": {
    "name": "Fitness aparati",
    "description": "Dostava i sastavljanje fitness opreme"
  },
  "general_transport": {
    "name": "Transport robe po RH",
    "description": "Sve vrste neopasnog tereta diljem Hrvatske"
  }
};

serviceCatalog.moving=serviceCatalog.moving_eu;
serviceCatalog.space_clearing=serviceCatalog.clearing;
serviceCatalog.waste_disposal=serviceCatalog.waste;
export function bookingRoute(booking,records){
 if(['origin','destination'].includes(booking.bookingType)){
  const mate=records.find(b=>b.id===booking.originalBookingId);
  if(!mate||mate.originalBookingId!==booking.id||mate.bookingType===booking.bookingType)return null;
  const origin=booking.bookingType==='origin'?booking:mate,destination=booking.bookingType==='destination'?booking:mate;
  return origin.location||origin.from ? {from:origin.location||origin.from,to:destination.location||destination.from} : null;
 }
 return booking.from&&booking.to?{from:booking.from,to:booking.to}:null;
}
export function describeBooking(booking,records){
 const mate=records.find(b=>b.id===booking.originalBookingId&&b.originalBookingId===booking.id);
 return {general:serviceCatalog[booking.service]?.description||'',custom:booking.serviceDescription?.trim()||booking.message?.trim()||mate?.serviceDescription?.trim()||mate?.message?.trim()||''};
}
const cache=new Map();
async function raw_measureBookingRoute(route,maps=()=>globalThis.google?.maps){
 const key=JSON.stringify([route.from,route.to]);if(cache.has(key))return cache.get(key);
 for(let i=0;i<40&&!maps()?.DirectionsService;i++)await new Promise(r=>setTimeout(r,250));
 const api=maps();if(!api?.DirectionsService)throw Error('Karta nije dostupna. Ponovno otvorite detalje za novi pokušaj.');
 const result=await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(Error('Izračun traje predugo. Ponovno otvorite detalje za novi pokušaj.')),20000);
  new api.DirectionsService().route({origin:route.from,destination:route.to,travelMode:api.TravelMode.DRIVING},(response,status)=>{
   clearTimeout(timer);const leg=response?.routes?.[0]?.legs?.[0];
   if(status==='OK'&&leg?.distance&&leg?.duration)resolve({meters:leg.distance.value,seconds:leg.duration.value});
   else reject(Error('Put nije dostupan. Provjerite polazište i odredište.'));
  });
 });cache.set(key,result);return result;
}

export const measureBookingRoute=(...args)=>globalThis.appLoading?globalThis.appLoading.track(()=>raw_measureBookingRoute(...args),"Izračun udaljenosti…"):raw_measureBookingRoute(...args);
