const labels={cargoType:{furniture:'Namještaj',appliances:'Bijela tehnika',mattress:'Madraci i kreveti',garden:'Vrtni namještaj',mixed:'Mješovita roba',other:'Ostalo'},pickupElevator:{unknown:'Nije navedeno',no:'Nema dizala',yes:'Ima dizalo',small:'Dizalo je premalo za robu'},deliveryElevator:{unknown:'Nije navedeno',no:'Nema dizala',yes:'Ima dizalo',small:'Dizalo je premalo za robu'},parking:{unknown:'Nije navedeno',near:'Moguć pristup kombijem',limited:'Otežan pristup / udaljeno parkiranje'}};
function handlingFields(data){
 const out={};for(const key of ['pickupFloor','deliveryFloor']){const value=String(data[key]??'');if(value!==''&&(!/^(0|[1-9]|1[0-9]|20)$/.test(value)))throw Error('Kat mora biti od prizemlja do 20.');out[key]=value;}
 for(const [key,options] of Object.entries(labels)){const v=data[key]||Object.keys(options)[0];if(!Object.hasOwn(options,v))throw Error('Neispravna opcija dostave.');out[key]=v;}
 for(const key of ['carryIn','assembly','oldRemoval','callBefore']){if(data[key]!=null&&!['on','',true,false].includes(data[key]))throw Error('Neispravan dodatni zahtjev.');out[key]=data[key]==='on'||data[key]===true;}
 const count=String(data.packageCount??'');if(count!==''&&(!/^\d{1,4}$/.test(count)||Number(count)<1))throw Error('Broj paketa mora biti od 1 do 9999.');out.packageCount=count;
 const floor=v=>v===''?'Nije navedeno':v==='0'?'Prizemlje':v+'. kat';
 out.handlingSummary=[`Vrsta robe: ${labels.cargoType[out.cargoType]}`,`Preuzimanje: ${floor(out.pickupFloor)}; ${labels.pickupElevator[out.pickupElevator]}`,`Dostava: ${floor(out.deliveryFloor)}; ${labels.deliveryElevator[out.deliveryElevator]}`,`Pristup: ${labels.parking[out.parking]}`,count?`Broj paketa: ${count}`:'',...Object.entries({carryIn:'Unošenje u stan',assembly:'Montaža',oldRemoval:'Odvoz stare robe',callBefore:'Nazvati prije dolaska'}).filter(([key])=>out[key]).map(([,label])=>'Zahtjev: '+label)].filter(Boolean).join('\n');return out;
}
module.exports={handlingFields};
