import {showDeliveryProof} from './delivery-proof-view.mjs';
import { functions, httpsCallable } from './firebase-config.js?v=loading-1';
import {serviceCatalog,bookingRoute,describeBooking,measureBookingRoute} from './booking-details.mjs?v=loading-1';
import {setTransportStatus,removeTransportBooking} from './route-store.js?v=loading-1';
import {createRoutePlanner} from './route-planner.js?v=loading-1';
// Import Firebase auth functions
import { checkAuthState, checkIfAdmin, getAllBookings, getAllUsers, updateBookingStatus, deleteBooking, logoutUser } from './firebase-auth.js?v=loading-1';

let allBookings = [];
let allUsers = [];
let currentBookingId = null;
let isAdminUser = false;

// Check if user is authenticated and is admin
checkAuthState(async (user) => {
    if (user) {
        isAdminUser = await checkIfAdmin();
        if (!isAdminUser) {
            window.location.href = 'admin-login.html';
        } else {
            document.getElementById('adminName').textContent=user.displayName || 'Administrator';
            // Load initial data
            loadOverview();
        }
    } else {
        window.location.href = 'admin-login.html';
    }
});

document.getElementById('adminLogoutBtn').addEventListener('click', async () => {
    const result = await logoutUser();
    if (result.success) {
        window.location.href = 'admin-login.html';
    }
});

document.querySelectorAll('.sidebar-item[data-section]').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.getAttribute('data-section');
        
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        document.getElementById(section).classList.add('active');
        
        if (section === 'bookings') {
            loadBookings();
        } else if (section === 'routes') {
            loadRoutesMap();
        } else if (section === 'users') {
            loadUsers();
        } else if (section === 'services') {
            loadServiceStats();
        } else if (section === 'overview') {
            loadOverview();
        }
    });
});

async function loadOverview() {
    const [bookingsResult, usersResult] = await Promise.all([
        getAllBookings(),
        getAllUsers()
    ]);

    if(!bookingsResult.success || !usersResult.success){document.getElementById('recentActivity').textContent='Podaci se trenutačno ne mogu učitati. Ponovno otvorite pregled.';return;}
    if (bookingsResult.success && usersResult.success) {
        const bookings = bookingsResult.bookings;
        allBookings=bookings;allUsers=usersResult.users;
        const users = usersResult.users;

        document.getElementById('totalBookings').textContent = bookings.length;
        document.getElementById('pendingBookings').textContent = bookings.filter(b => b.status === 'pending').length;
        document.getElementById('confirmedBookings').textContent = bookings.filter(b => b.status === 'confirmed').length;
        document.getElementById('totalUsers').textContent = users.length;

        const recentActivity = document.getElementById('recentActivity');
        const recent = [...bookings].sort((a,b)=>dateMillis(b.createdAt)-dateMillis(a.createdAt)).slice(0,10);
        
        if (recent.length === 0) {
            recentActivity.innerHTML = '<p class="no-data">Nema nedavnih aktivnosti</p>';
        } else {
            recentActivity.innerHTML = recent.map(booking => `
                <div class="activity-item">
                    <div class="activity-time">${escapeHtml(formatDate(booking.createdAt))}</div>
                    <div class="activity-text">
                        Nova rezervacija: <strong>${escapeHtml(getServiceName(booking.serviceCategory))}</strong> - ${escapeHtml(booking.from)}
                    </div>
                </div>
            `).join('');
        }
    }
}

async function loadBookings() {
    const [result, usersResult] = await Promise.all([getAllBookings(),getAllUsers()]);
    if(usersResult.success)allUsers=usersResult.users;
    if (result.success) {
        allBookings = result.bookings;
        filterBookings();
    } else {
        console.error('Error loading bookings:', result.message);
        document.getElementById('bookingsTableBody').innerHTML = '<tr><td colspan="8" class="no-data">Greška pri učitavanju rezervacija</td></tr>';
    }
}

function displayBookings(bookings) {
    const tbody = document.getElementById('bookingsTableBody');
    
    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">Nema rezervacija</td></tr>';
        return;
    }

    tbody.innerHTML = bookings.map(booking => `
        <tr>
            <td>#${booking.id.slice(-6)}</td>
            <td>${escapeHtml(getUserName(booking.userId))}</td>
            <td>${escapeHtml(getServiceName(booking.serviceCategory))}</td>
            <td>${escapeHtml(booking.date)} ${escapeHtml(booking.time)}</td>
            <td>${escapeHtml(booking.from)}${escapeHtml(booking.to ? ' – ' + booking.to : '')}</td>
            <td>${booking.source==='partner'?'<strong>JYSK · '+escapeHtml(booking.partnerStore||'')+'</strong><br>':''}${escapeHtml(booking.serviceDescription || '-')}</td>
            <td><span class="status-badge ${escapeHtml(booking.status)}">${escapeHtml(getStatusText(booking.status))}</span></td>
            <td>
                <button aria-label="Prikaži detalje" class="action-btn btn-view" onclick="viewBooking('${escapeHtml(booking.id)}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button aria-label="Obriši" class="action-btn btn-delete" onclick="confirmDeleteBooking('${booking.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('statusFilter').addEventListener('change', filterBookings);
document.getElementById('serviceFilter').addEventListener('change', filterBookings);
document.getElementById('searchBooking').addEventListener('input', filterBookings);

function filterBookings() {
    const statusFilter = document.getElementById('statusFilter').value;
    const serviceFilter = document.getElementById('serviceFilter').value;
    const searchTerm = document.getElementById('searchBooking').value.toLowerCase();

    let filtered = allBookings;

    if (statusFilter !== 'all') {
        filtered = filtered.filter(b => b.status === statusFilter);
    }

    if (serviceFilter !== 'all') {
        filtered = filtered.filter(b => b.serviceCategory === serviceFilter);
    }

    if (searchTerm) {
        filtered = filtered.filter(b => 
            b.id.toLowerCase().includes(searchTerm) ||
            String(b.name||b.email||getUserName(b.userId)).toLowerCase().includes(searchTerm) ||
            String(b.from||'').toLowerCase().includes(searchTerm) ||
            [b.partnerName,b.partnerStore,b.orderNumber,b.phone].filter(Boolean).join(' ').toLowerCase().includes(searchTerm)
        );
    }

    displayBookings(filtered);
}

async function loadUsers() {
    const [result, bookingsResult] = await Promise.all([getAllUsers(),getAllBookings()]);
    if(bookingsResult.success)allBookings=bookingsResult.bookings;
    
    if (result.success) {
        allUsers = result.users;
        displayUsers(allUsers);
    } else {
        console.error('Error loading users:', result.message);
        document.getElementById('usersTableBody').innerHTML = '<tr><td colspan="7" class="no-data">Greška pri učitavanju korisnika</td></tr>';
    }
}

async function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">Nema korisnika</td></tr>';
        return;
    }

    // Get admin list
    const { collection, getDocs, db } = await import('./firebase-config.js?v=loading-1');
    const adminsSnapshot = await getDocs(collection(db, 'admins'));
    const adminIds = new Set();
    adminsSnapshot.forEach(doc => adminIds.add(doc.id));

    tbody.innerHTML = users.map(user => {
        const userBookings = allBookings.filter(b => b.userId === user.id).length;
        const isAdmin = adminIds.has(user.id);
        return `
            <tr>
                <td>#${user.id.slice(-6)}</td>
                <td>${escapeHtml(user.name)} ${isAdmin ? '<span style="color: #e31e24; font-weight: bold;">ADMIN</span>' : ''}</td>
                <td>${escapeHtml(user.email)}</td>
                <td>${escapeHtml(user.phone || '-')}</td>
                <td>${escapeHtml(formatDate(user.createdAt))}</td>
                <td>${escapeHtml(userBookings)}</td>
                <td>
                    <button class="action-btn btn-view" onclick="viewUserDetails('${user.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${!isAdmin ? `
                        <button class="action-btn btn-success" onclick="makeAdminById('${user.id}')" title="Make Admin">
                            <i class="fas fa-user-shield"></i>
                        </button>
                    ` : `
                        <button class="action-btn btn-danger" onclick="removeAdmin('${user.id}')" title="Remove Admin">
                            <i class="fas fa-user-minus"></i>
                        </button>
                    `}
                    <button class="action-btn btn-delete" onclick="deleteUserById('${user.id}')" title="Delete User">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

document.getElementById('searchUser').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allUsers.filter(u => 
        String(u.name||'').toLowerCase().includes(searchTerm) ||
        String(u.email||'').toLowerCase().includes(searchTerm)
    );
    displayUsers(filtered);
});

async function loadServiceStats() {
    const result = await getAllBookings();
    
    if (result.success) {
        const bookings = result.bookings;
        
        document.getElementById('transportCount').textContent = bookings.filter(b => b.serviceCategory === 'transport').length;
        document.getElementById('cleaningCount').textContent = bookings.filter(b => b.serviceCategory === 'cleaning').length;
        document.getElementById('gardenCount').textContent = bookings.filter(b => b.serviceCategory === 'garden').length;
        document.getElementById('rentalCount').textContent = bookings.filter(b => b.serviceCategory === 'rental').length;
        document.getElementById('specialCount').textContent = bookings.filter(b => b.serviceCategory === 'special').length;
    } else {
        console.error('Error loading service stats:', result.message);
    }
}

window.makeAdmin = async function(userId, email, name) {
    if (!await notify.ask(`Dodijeliti administratorske ovlasti korisniku ${name}?`)) {
        return;
    }
    
    try {
        const { doc, setDoc, db } = await import('./firebase-config.js?v=loading-1');
        await setDoc(doc(db, 'admins', userId), {
            role: 'admin',
            email: email,
            name: name,
            createdAt: new Date()
        });
        
        notify.success(`${name} is now an admin!`);
        loadUsers();
    } catch (error) {
        console.error('Error making admin:', error);
        notify.error('Error making user admin');
    }
}

window.removeAdmin = async function(userId) {
    if (!await notify.ask('Ukloniti administratorske ovlasti ovom korisniku?')) {
        return;
    }
    
    try {
        const { doc, deleteDoc, db } = await import('./firebase-config.js?v=loading-1');
        await deleteDoc(doc(db, 'admins', userId));
        
        notify.success('Admin privileges removed');
        loadUsers();
    } catch (error) {
        console.error('Error removing admin:', error);
        notify.error('Error removing admin privileges');
    }
}

window.deleteUser = async function(userId, userName) {
    if (!await notify.ask(`Trajno obrisati korisnika ${userName} i njegove rezervacije? Ovu radnju nije moguće poništiti.`)) {
        return;
    }
    
    try {
        const { doc, deleteDoc, collection, query, where, getDocs, db } = await import('./firebase-config.js?v=loading-1');
        
        // Delete user's bookings first
        const bookingsQuery = query(collection(db, 'bookings'), where('userId', '==', userId));
        const bookingsSnapshot = await getDocs(bookingsQuery);
        
        const deletePromises = [];
        bookingsSnapshot.forEach((bookingDoc) => {
            deletePromises.push(deleteDoc(doc(db, 'bookings', bookingDoc.id)));
        });
        
        // Delete admin role if exists
        try {
            await deleteDoc(doc(db, 'admins', userId));
        } catch (e) {
            // Admin role might not exist, ignore error
        }
        
        // Delete user document
        deletePromises.push(deleteDoc(doc(db, 'users', userId)));
        
        await Promise.all(deletePromises);
        
        notify.success(`User ${userName} deleted successfully`);
        loadUsers();
        loadOverview(); // Refresh stats
    } catch (error) {
        console.error('Error deleting user:', error);
        notify.error('Error deleting user');
    }
}

window.viewUserDetails = function(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
        const userBookings = allBookings.filter(b => b.userId === userId);
        const modal = document.getElementById('userModal');
        const details = document.getElementById('userDetails');
        
        details.innerHTML = `
            <div class="detail-row">
                <strong>Ime:</strong>
                <span>${escapeHtml(user.name)}</span>
            </div>
            <div class="detail-row">
                <strong>Email:</strong>
                <span>${escapeHtml(user.email)}</span>
            </div>
            <div class="detail-row">
                <strong>Telefon:</strong>
                <span>${escapeHtml(user.phone || 'N/A')}</span>
            </div>
            <div class="detail-row">
                <strong>Datum Registracije:</strong>
                <span>${escapeHtml(formatDate(user.createdAt))}</span>
            </div>
            <div class="detail-row">
                <strong>Ukupno Rezervacija:</strong>
                <span>${escapeHtml(userBookings.length)}</span>
            </div>
        `;
        
        modal.style.display = 'block';
    }
}

window.closeUserModal = function() {
    document.getElementById('userModal').style.display = 'none';
}

const routePlanner=createRoutePlanner({getBookings:getAllBookings,canUse:()=>isAdminUser,onRecords:records=>{allBookings=records;},viewBooking:id=>window.viewBooking(id)});
window.initAdminMap=()=>routePlanner.mapsReady();
async function loadRoutesMap(){await routePlanner.load();}
function getServiceNameCroatian(service) {
    const serviceNames = {
        vehicle_transport: 'Prijevoz motornih vozila',
        furniture_appliances: 'Namještaj i kućanski aparati',
        general_cargo: 'Paletirana i rasuti teret',
        cargo: 'Paletirana i rasuti teret',
        installation: 'Instalacija i deinstalacija aparata',
        furniture_assembly: 'Dostava i ugradnja namještaja',
        fitness_equipment: 'Fitness aparati',
        general_transport: 'Transport robe po RH',
        moving: 'Selidbe po EU',
        space_clearing: 'Pražnjenje prostora',
        waste_disposal: 'Odvoz otpada',
        transport: 'Prijevoz i dostava'
    };
    return serviceCatalog[service]?.name || serviceNames[service] || service || 'Transport';
}

window.viewBooking = function(bookingId) {
    const booking = allBookings.find(b => b.id === bookingId) || routePlanner.records().find(b => b.id === bookingId);
    if (!booking) return;

    const records=[...allBookings,...routePlanner.records()];
    const route=bookingRoute(booking,records);
    const description=describeBooking(booking,records);
    currentBookingId = bookingId;
    const modal = document.getElementById('bookingModal');
    const details = document.getElementById('bookingDetails');

    details.innerHTML = `
        <div class="detail-row">
            <div class="detail-label">ID Rezervacije:</div>
            <div class="detail-value">#${booking.id}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Korisnik:</div>
            <div class="detail-value">${escapeHtml(booking.name || booking.email || getUserName(booking.userId))}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Email:</div>
            <div class="detail-value">${escapeHtml(booking.email || '-')}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Telefon:</div>
            <div class="detail-value">${escapeHtml(booking.phone || '-')}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Tip Rezervacije:</div>
            <div class="detail-value">${escapeHtml(booking.locationLabel || booking.bookingType || 'Standard')}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Usluga:</div>
            <div class="detail-value">${escapeHtml(getServiceNameCroatian(booking.service))}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Datum & Vrijeme:</div>
            <div class="detail-value">${escapeHtml(booking.date || (booking.source==='partner'?'Čeka raspoređivanje':'—'))} ${escapeHtml(booking.time || '')}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Lokacija:</div>
            <div class="detail-value">${escapeHtml(route?.to ? route.from+' – '+route.to : booking.location || booking.from || 'Nije navedena')}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Udaljenost:</div>
            <div class="detail-value" id="bookingRouteDistance" aria-live="polite">${route?.to ? 'Izračunavam…' : 'Nije primjenjivo — nema potpune relacije'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Procjena vožnje:</div>
            <div class="detail-value" id="bookingRouteDuration" aria-live="polite">${route?.to ? 'Izračunavam…' : 'Nije primjenjivo'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Opis Usluge:</div>
            <div class="detail-value">${escapeHtml(description.general)}${description.custom ? '<br><strong>Zahtjev klijenta:</strong><br>'+escapeHtml(description.custom) : '<br>Klijent nije naveo dodatni opis.'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Približna Težina:</div>
            <div class="detail-value">${escapeHtml(booking.approxWeight ? booking.approxWeight + ' kg' : '-')}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Napomene:</div>
            <div class="detail-value">${escapeHtml(booking.notes || '-')}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Status:</div>
            <div class="detail-value"><span class="status-badge ${escapeHtml(booking.status)}">${escapeHtml(getStatusText(booking.status))}</span></div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Kreirano:</div>
            <div class="detail-value">${escapeHtml(formatDate(booking.createdAt))}</div>
        </div>
    `;

    if(route?.to){
        const distanceEl=details.querySelector('#bookingRouteDistance');
        const durationEl=details.querySelector('#bookingRouteDuration');
        measureBookingRoute(route).then(result=>{
            if(!distanceEl.isConnected)return;
            distanceEl.textContent=(result.meters/1000).toLocaleString('hr-HR',{maximumFractionDigits:1})+' km';
            const minutes=Math.ceil(result.seconds/60);
            durationEl.textContent=(minutes>=60?Math.floor(minutes/60)+' h ':'')+(minutes%60)+' min — bez utovara, istovara i zadržavanja';
        }).catch(error=>{if(distanceEl.isConnected){distanceEl.textContent=error.message;durationEl.textContent='Procjena nije dostupna';}});
    }

    if(booking.hasProof){const button=document.createElement('button');button.className='btn-primary';button.textContent='Potvrda uručenja';button.onclick=()=>showDeliveryProof(httpsCallable(functions,'driverPortal'),booking.id);details.append(button);}
    if(booking.handlingSummary){const row=document.createElement('div');row.className='detail-row';const label=document.createElement('strong');label.textContent='Uvjeti dostave:';const value=document.createElement('div');value.textContent=booking.handlingSummary;value.style.whiteSpace='pre-line';row.append(label,value);details.append(row);}
    if(booking.source==='partner'){
        const box=document.createElement('section');box.className='planner-issue';
        const info=document.createElement('p');info.textContent='JYSK · '+(booking.partnerStore||'')+' · Kontakt trgovine: '+(booking.partnerContact||'')+' '+(booking.partnerPhone||'');box.append(info);
        const request=document.createElement('p');request.textContent='Narudžba: '+(booking.orderNumber||'—')+' · '+({agreed:'Dogovoreni termin',preferred:'Željeni termin',flexible:'Termin nije dogovoren'}[booking.appointmentType]||'Termin')+': '+(booking.requestedDate||'—')+' '+(booking.requestedTime||'');box.append(request);
        const form=document.createElement('form');const date=document.createElement('input');date.type='date';date.required=true;date.value=booking.date||booking.requestedDate||'';date.setAttribute('aria-label','Datum dostave');
        const time=document.createElement('input');time.type='time';time.value=booking.time||booking.requestedTime||'';time.setAttribute('aria-label','Vrijeme dostave');
        const button=document.createElement('button');button.type='submit';button.className='btn-primary';button.textContent='Spremi termin za planiranje';form.append(date,time,button);box.append(form);details.prepend(box);
        form.addEventListener('submit',async e=>{e.preventDefault();if(button.disabled)return;button.disabled=true;try{await httpsCallable(functions,'partnerPortal')({action:'schedule',id:booking.id,date:date.value,time:time.value});Object.assign(booking,{date:date.value,time:time.value,position:null,routeDriver:null,routePlanDate:null});notify.success('Termin je spremljen. U Mapi ruta odaberite taj datum i osvježite plan.');window.viewBooking(booking.id);}catch(error){notify.error(error.message);}finally{button.disabled=false;}});
    }
    // Show Accept/Deny buttons only for pending bookings
    const modalActions = document.getElementById('modalActions');
    const modalActionsAlternate = document.getElementById('modalActionsAlternate');
    const acceptBtn = document.getElementById('acceptBtn');
    const denyBtn = document.getElementById('denyBtn');
    
    if (booking.status === 'pending') {
        modalActions.style.display = 'flex';
        modalActionsAlternate.style.display = 'none';
    } else {
        modalActions.style.display = 'none';
        modalActionsAlternate.style.display = 'flex';
        document.getElementById('modalStatusSelect').value = booking.status;
    }
    
    modal.style.display = 'block';
}

// Accept booking
async function acceptBooking() {
    if (!currentBookingId) return;
    
    if (!await notify.ask('Jeste li sigurni da želite prihvatiti ovu rezervaciju? Korisniku će biti poslan email.')) {
        return;
    }
    
    try {
        const { doc, updateDoc, db } = await import('./firebase-config.js?v=loading-1');
        
        await setTransportStatus(currentBookingId, {
            status: 'confirmed'
        });
        
        notify.success('Rezervacija prihvaćena. Obavijest korisniku šalje se automatski.');
        document.getElementById('bookingModal').style.display = 'none';
        loadBookings();
        loadRoutesMap();
    } catch (error) {
        console.error('Error accepting booking:', error);
        notify.error('Greška pri prihvaćanju rezervacije');
    }
}

// Deny booking
async function denyBooking() {
    if (!currentBookingId) return;
    
    const reason = await notify.input('Unesite razlog odbijanja (bit će poslan korisniku):', '', {multiline:true,title:'Odbijanje rezervacije',label:'Razlog odbijanja'});
    if (!reason) return;
    
    try {
        const { doc, updateDoc, db } = await import('./firebase-config.js?v=loading-1');
        
        await setTransportStatus(currentBookingId, {
            status: 'cancelled',
            cancellationReason: reason,
            cancelledBy: 'admin'
        });
        
        notify.success('Rezervacija odbijena. Obavijest korisniku šalje se automatski.');
        document.getElementById('bookingModal').style.display = 'none';
        loadBookings();
        loadRoutesMap();
    } catch (error) {
        console.error('Error denying booking:', error);
        notify.error('Greška pri odbijanju rezervacije');
    }
}

window.acceptBooking = acceptBooking;
window.denyBooking = denyBooking;

async function updateStatus() {
    if (!currentBookingId) return;

    const newStatus = document.getElementById('modalStatusSelect').value;

    let result;try{await setTransportStatus(currentBookingId,{status:newStatus});result={success:true};}catch(error){result={success:false,message:error.message};}

    if (result.success) {
        notify.success('Status uspješno ažuriran!');
        document.getElementById('bookingModal').style.display = 'none';
        loadBookings();
        loadOverview();
    } else {
        notify.error(result.message || 'Greška pri ažuriranju statusa');
    }
}

window.confirmDeleteBooking = function(bookingId) {
    notify.confirmDelete(
        'Obrisati ovu rezervaciju, uključujući povezano preuzimanje i dostavu?',
        'Potvrda brisanja',
        () => deleteBookingById(bookingId)
    );
}

async function deleteBookingConfirm() {
    if (!currentBookingId) return;
    notify.confirmDelete(
        'Obrisati ovu rezervaciju, uključujući povezano preuzimanje i dostavu?',
        'Potvrda brisanja',
        async () => {
            await deleteBookingById(currentBookingId);
            document.getElementById('bookingModal').style.display = 'none';
        }
    );
}

async function deleteBookingById(bookingId) {
    try {
        const { deleteBooking } = await import('./firebase-auth.js?v=loading-1');
        await removeTransportBooking(bookingId);
        const result = {success:true};

        if (result.success) {
            notify.success('Rezervacija uspješno obrisana!');
            loadBookings();
            loadOverview();
            loadRoutesMap(); // Refresh routes map
            document.getElementById('bookingModal').style.display = 'none';
        } else {
            notify.error(result.message || 'Greška pri brisanju rezervacije');
        }
    } catch (error) {
        console.error('Error deleting booking:', error);
        notify.error('Greška pri brisanju rezervacije');
    }
}

function viewUserDetails(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    const userBookings = allBookings.filter(b => b.userId === userId);
    
    notify.info(
        `Ime: ${user.name}\nEmail: ${user.email}\nTelefon: ${user.phone || '-'}\nBroj rezervacija: ${userBookings.length}`,
        'Detalji Korisnika'
    );
}

function getUserName(userId) {
    const user = allUsers.find(u => u.id === userId);
    return user?.name || user?.email || allBookings.find(b=>b.userId===userId)?.name || 'Gost';
}

function getServiceName(service) {
    const serviceNames = {
        transport: 'Prijevoz i Dostava sa Instalacijom',
        cleaning: 'Čišćenje',
        garden: 'Održavanje Zelenih Površina',
        rental: 'Najam Opreme',
        special: 'Specijalne Usluge'
    };
    return serviceNames[service] || service;
}

function getStatusText(status) {
    const statusTexts = {
        pending: 'Na Čekanju',
        confirmed: 'Prihvaćeno',
        in_transit: 'Dostava je krenula',
        completed: 'Završeno',
        cancelled: 'Otkazano'
    };
    return statusTexts[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    
    // Handle Firestore timestamp
    if (dateString && typeof dateString === 'object' && dateString.toDate) {
        const date = dateString.toDate();
        return date.toLocaleDateString('hr-HR') + ' ' + date.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Handle regular date string
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleDateString('hr-HR') + ' ' + date.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
}

document.querySelectorAll('.close').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('bookingModal').style.display = 'none';
    });
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('bookingModal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

function csvDownload(name,rows){const cell=v=>'"'+String(v??'').replace(/^[=+@-]/,"'").replaceAll('"','""')+'"';const data='\uFEFF'+rows.map(r=>r.map(cell).join(';')).join('\r\n');const url=URL.createObjectURL(new Blob([data],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function exportBookings(start,end){const result=await getAllBookings();if(!result.success){notify.error(result.message||'Učitavanje nije uspjelo.');return;}const rows=result.bookings.filter(b=>(!start||b.date>=start)&&(!end||b.date<=end));csvDownload('rezervacije.csv',[['ID','Klijent','Email','Telefon','Usluga','Datum','Vrijeme','Polazište','Odredište','Status'],...rows.map(b=>[b.id,b.name,b.email,b.phone,getServiceName(b.serviceCategory),b.date,b.time,b.from,b.to,getStatusText(b.status)])]);}
window.generateMonthlyReport=()=>{const d=new Date(),start=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-01',end=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+new Date(d.getFullYear(),d.getMonth()+1,0).getDate();return exportBookings(start,end);};
window.generateYearlyReport=()=>exportBookings(new Date().getFullYear()+'-01-01',new Date().getFullYear()+'-12-31');
window.generateUsersReport=async()=>{const r=await getAllUsers();if(!r.success){notify.error(r.message);return;}csvDownload('korisnici.csv',[['Ime','Email','Telefon','Registracija'],...r.users.map(u=>[u.name,u.email,u.phone,formatDate(u.createdAt)])]);};
window.generateCustomReport=()=>{const start=document.getElementById('reportStartDate').value,end=document.getElementById('reportEndDate').value;if(!start||!end||start>end){notify.warning('Odaberite ispravan početni i završni datum.');return;}return exportBookings(start,end);};
window.changeAdminPassword=()=>{window.location.href='password-reset.html';};
window.makeAdminById=id=>{const u=allUsers.find(u=>u.id===id);if(u)window.makeAdmin(id,u.email,u.name);};
window.deleteUserById=id=>{const u=allUsers.find(u=>u.id===id);if(u)window.deleteUser(id,u.name);};
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function dateMillis(v){if(v?.toDate)return v.toDate().getTime();if(v?.seconds)return v.seconds*1000;return new Date(v||0).getTime()||0;}

for(const modal of document.querySelectorAll('#bookingModal,#userModal')){modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');const heading=modal.querySelector('h2');if(heading){heading.id=modal.id+'Title';modal.setAttribute('aria-labelledby',heading.id);}let previous;new MutationObserver(()=>{if(modal.style.display==='block'){previous=document.activeElement;modal.querySelector('.close')?.focus();}else previous?.focus();}).observe(modal,{attributes:true,attributeFilter:['style']});modal.addEventListener('keydown',e=>{if(e.key==='Escape'){modal.style.display='none';}if(e.key==='Tab'){const list=[...modal.querySelectorAll('button,select,input,[tabindex="0"]')].filter(el=>el.getClientRects().length);if(e.shiftKey&&document.activeElement===list[0]){e.preventDefault();list.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===list.at(-1)){e.preventDefault();list[0]?.focus();}}});}

window.updateStatus=updateStatus;
window.deleteBookingConfirm=deleteBookingConfirm;
