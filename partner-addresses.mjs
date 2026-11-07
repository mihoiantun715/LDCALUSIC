export function addressFromPlace(place){
 const components=place?.address_components||[],has=type=>components.some(c=>c.types?.includes(type));
 if(!place?.place_id||!place?.formatted_address||!place?.geometry?.location||place.partial_match||!has('route')||!has('street_number')||!(has('locality')||has('postal_town')||has('administrative_area_level_2')))return null;
 return {address:place.formatted_address,placeId:place.place_id};
}
export function attachAddressChecks(form){
 const states=new Map();let ready=false,geocoder;
 for(const name of ['from','to']){
 const input=form.elements[name],hint=document.createElement('small'),button=document.createElement('button');
 hint.setAttribute('role','status');hint.textContent='Učitavam Google provjeru adrese…';button.type='button';button.textContent='Provjeri adresu';button.disabled=true;
 input.after(hint,button);input.autocomplete='off';input.setCustomValidity('Odaberite i potvrdite potpunu adresu.');
 const state={input,hint,button,confirmed:'',revision:0};states.set(name,state);
 const clear=()=>{state.revision++;state.confirmed='';input.setCustomValidity('Odaberite adresu iz Google prijedloga ili kliknite Provjeri adresu.');hint.textContent=ready?'Odaberite prijedlog s ulicom i kućnim brojem ili provjerite unos.':'Provjera adrese još nije dostupna.';};input.addEventListener('input',clear);
 state.accept=place=>{const value=addressFromPlace(place);if(!value){clear();hint.textContent='Nije potvrđena potpuna adresa. Unesite ulicu, kućni broj i grad te odaberite točan prijedlog.';return false;}input.value=value.address;state.confirmed=value.address;input.setCustomValidity('');hint.textContent='Pronađeno na Google karti: '+value.address;return true;};
 button.onclick=()=>{if(!ready||!input.value.trim())return;const revision=++state.revision;state.confirmed='';input.setCustomValidity('Pričekajte provjeru adrese.');button.disabled=true;hint.textContent='Provjeravam…';let finished=false;const finish=()=>{finished=true;button.disabled=false;};const timer=setTimeout(()=>{if(finished)return;finish();if(revision!==state.revision)return;input.setCustomValidity('Provjera nije uspjela. Ponovite provjeru.');hint.textContent='Provjera traje predugo. Pokušajte ponovno.';},12000);
 geocoder.geocode({address:input.value.trim(),componentRestrictions:{country:'HR'}},(results,status)=>{if(finished)return;clearTimeout(timer);finish();if(revision!==state.revision)return;if(status==='OK'&&results.length===1)state.accept(results[0]);else{clear();hint.textContent=status==='OK'?'Pronađeno je više mogućih adresa. Odaberite točnu iz prijedloga.':'Adresa nije potvrđena. Provjerite unos ili pokušajte ponovno.';}});};
 }
 const initialize=()=>{if(ready)return;ready=true;geocoder=new google.maps.Geocoder();for(const state of states.values()){state.button.disabled=false;state.hint.textContent='Upišite ulicu i broj, pa odaberite Google prijedlog.';const autocomplete=new google.maps.places.Autocomplete(state.input,{componentRestrictions:{country:'hr'},fields:['address_components','formatted_address','geometry','place_id'],types:['address']});autocomplete.addListener('place_changed',()=>{state.revision++;state.accept(autocomplete.getPlace());});}};
 window.initPartnerAddresses=initialize;
 if(window.google?.maps?.places)initialize();else{const script=document.createElement('script');script.src='https://maps.googleapis.com/maps/api/js?key=AIzaSyBVtCR6XBaKjIKtPPpo01IWu9e4lrjMRz8&libraries=places&callback=initPartnerAddresses&loading=async&language=hr&region=HR';script.async=true;script.onerror=()=>{for(const s of states.values())s.hint.textContent='Google provjera nije dostupna. Osvježite stranicu i provjerite vezu.';};document.head.append(script);}
 form.addEventListener('reset',()=>{for(const s of states.values()){s.revision++;s.confirmed='';s.input.setCustomValidity('Odaberite i potvrdite potpunu adresu.');s.hint.textContent='Upišite ulicu i broj, pa odaberite Google prijedlog.';}});
 return {validate(){for(const s of states.values())if(!s.confirmed||s.input.value!==s.confirmed){s.input.setCustomValidity('Ponovno potvrdite adresu.');s.input.reportValidity();return false;}return true;}};
}
