import {db,doc} from './firebase-config.js?v=loading-1';
import {runTransaction,serverTimestamp} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {createRouteStore} from './route-store-core.mjs?v=tracking-1';
const store=createRouteStore({db,doc,runTransaction,serverTimestamp});
export const saveRoutePlan=updates=>busy(()=>store.save(updates));
export const setTransportStatus=(id,patch)=>busy(()=>store.setStatus(id,patch));

export const removeTransportBooking=id=>busy(()=>store.remove(id));

const busy=task=>globalThis.appLoading?globalThis.appLoading.track(task,'Spremanje plana…'):task();
