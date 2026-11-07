import test from 'node:test';
import assert from 'node:assert/strict';
import {bookingRoute,describeBooking,measureBookingRoute} from '../booking-details.mjs';
test('details resolve linked pickup and delivery in either direction',()=>{
 const a={id:'a',bookingType:'origin',originalBookingId:'b',location:'Brod',service:'moving',serviceDescription:'Kutije'},b={id:'b',bookingType:'destination',originalBookingId:'a',location:'Osijek',service:'moving'};
 for(const row of [a,b])assert.deepEqual(bookingRoute(row,[a,b]),{from:'Brod',to:'Osijek'});
 assert.equal(bookingRoute(b,[b]),null);assert.equal(describeBooking(b,[a,b]).custom,'Kutije');assert.match(describeBooking(b,[a,b]).general,/selidbe/);
});
test('measurement uses road metrics and caches successful results only',async()=>{
 let calls=0;const maps=()=>({TravelMode:{DRIVING:'DRIVING'},DirectionsService:class{route(request,cb){calls++;assert.equal(request.origin,'Test A');cb({routes:[{legs:[{distance:{value:12500},duration:{value:1800}}]}]},'OK');}}});
 const route={from:'Test A',to:'Test B'};
 assert.deepEqual(await measureBookingRoute(route,maps),{meters:12500,seconds:1800});await measureBookingRoute(route,maps);assert.equal(calls,1);
});
test('failed route calculation does not invent a distance',async()=>{
 const maps=()=>({TravelMode:{DRIVING:'DRIVING'},DirectionsService:class{route(r,cb){cb(null,'ZERO_RESULTS');}}});
 await assert.rejects(measureBookingRoute({from:'invalid',to:'unknown'},maps),/Provjerite/);
});
