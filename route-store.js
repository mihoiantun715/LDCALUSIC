import {db,doc} from './firebase-config.js';
import {runTransaction,serverTimestamp} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {createRouteStore} from './route-store-core.mjs?v=tracking-1';
const store=createRouteStore({db,doc,runTransaction,serverTimestamp});
export const saveRoutePlan=updates=>store.save(updates);
export const setTransportStatus=(id,patch)=>store.setStatus(id,patch);

export const removeTransportBooking=id=>store.remove(id);
