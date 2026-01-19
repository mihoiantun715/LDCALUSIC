// Import Firebase auth functions
import { checkAuthState, checkIfAdmin, getAllBookings, getAllUsers, updateBookingStatus, deleteBooking, logoutUser } from './firebase-auth.js';

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

document.querySelectorAll('.sidebar-item').forEach(item => {
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

    if (bookingsResult.success && usersResult.success) {
        const bookings = bookingsResult.bookings;
        const users = usersResult.users;

        document.getElementById('totalBookings').textContent = bookings.length;
        document.getElementById('pendingBookings').textContent = bookings.filter(b => b.status === 'pending').length;
        document.getElementById('confirmedBookings').textContent = bookings.filter(b => b.status === 'confirmed').length;
        document.getElementById('totalUsers').textContent = users.length;

        const recentActivity = document.getElementById('recentActivity');
        const recent = bookings.slice(-10).reverse();
        
        if (recent.length === 0) {
            recentActivity.innerHTML = '<p class="no-data">Nema nedavnih aktivnosti</p>';
        } else {
            recentActivity.innerHTML = recent.map(booking => `
                <div class="activity-item">
                    <div class="activity-time">${formatDate(booking.createdAt)}</div>
                    <div class="activity-text">
                        Nova rezervacija: <strong>${getServiceName(booking.serviceCategory)}</strong> - ${booking.from}
                    </div>
                </div>
            `).join('');
        }
    }
}

async function loadBookings() {
    const result = await getAllBookings();
    
    if (result.success) {
        allBookings = result.bookings;
        displayBookings(allBookings);
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
            <td>${getUserName(booking.userId)}</td>
            <td>${getServiceName(booking.serviceCategory)}</td>
            <td>${booking.date} ${booking.time}</td>
            <td>${booking.from}${booking.to ? ' → ' + booking.to : ''}</td>
            <td>${booking.serviceDescription || '-'}</td>
            <td><span class="status-badge ${booking.status}">${getStatusText(booking.status)}</span></td>
            <td>
                <button class="action-btn btn-view" onclick="viewBooking('${booking.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn btn-delete" onclick="confirmDeleteBooking('${booking.id}')">
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
            getUserName(b.userId).toLowerCase().includes(searchTerm) ||
            b.from.toLowerCase().includes(searchTerm)
        );
    }

    displayBookings(filtered);
}

async function loadUsers() {
    const result = await getAllUsers();
    
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
    const { collection, getDocs, db } = await import('./firebase-config.js');
    const adminsSnapshot = await getDocs(collection(db, 'admins'));
    const adminIds = new Set();
    adminsSnapshot.forEach(doc => adminIds.add(doc.id));

    tbody.innerHTML = users.map(user => {
        const userBookings = allBookings.filter(b => b.userId === user.id).length;
        const isAdmin = adminIds.has(user.id);
        return `
            <tr>
                <td>#${user.id.slice(-6)}</td>
                <td>${user.name} ${isAdmin ? '<span style="color: #e31e24; font-weight: bold;">👑 ADMIN</span>' : ''}</td>
                <td>${user.email}</td>
                <td>${user.phone || '-'}</td>
                <td>${formatDate(user.createdAt)}</td>
                <td>${userBookings}</td>
                <td>
                    <button class="action-btn btn-view" onclick="viewUserDetails('${user.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${!isAdmin ? `
                        <button class="action-btn btn-success" onclick="makeAdmin('${user.id}', '${user.email}', '${user.name}')" title="Make Admin">
                            <i class="fas fa-user-shield"></i>
                        </button>
                    ` : `
                        <button class="action-btn btn-danger" onclick="removeAdmin('${user.id}')" title="Remove Admin">
                            <i class="fas fa-user-minus"></i>
                        </button>
                    `}
                    <button class="action-btn btn-delete" onclick="deleteUser('${user.id}', '${user.name}')" title="Delete User">
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
        u.name.toLowerCase().includes(searchTerm) ||
        u.email.toLowerCase().includes(searchTerm)
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
    if (!confirm(`Are you sure you want to make ${name} an admin?`)) {
        return;
    }
    
    try {
        const { doc, setDoc, db } = await import('./firebase-config.js');
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
    if (!confirm('Are you sure you want to remove admin privileges from this user?')) {
        return;
    }
    
    try {
        const { doc, deleteDoc, db } = await import('./firebase-config.js');
        await deleteDoc(doc(db, 'admins', userId));
        
        notify.success('Admin privileges removed');
        loadUsers();
    } catch (error) {
        console.error('Error removing admin:', error);
        notify.error('Error removing admin privileges');
    }
}

window.deleteUser = async function(userId, userName) {
    if (!confirm(`Are you sure you want to delete user ${userName}? This action cannot be undone and will also delete all their bookings.`)) {
        return;
    }
    
    try {
        const { doc, deleteDoc, collection, query, where, getDocs, db } = await import('./firebase-config.js');
        
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
                <span>${user.name}</span>
            </div>
            <div class="detail-row">
                <strong>Email:</strong>
                <span>${user.email}</span>
            </div>
            <div class="detail-row">
                <strong>Telefon:</strong>
                <span>${user.phone || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <strong>Datum Registracije:</strong>
                <span>${formatDate(user.createdAt)}</span>
            </div>
            <div class="detail-row">
                <strong>Ukupno Rezervacija:</strong>
                <span>${userBookings.length}</span>
            </div>
        `;
        
        modal.style.display = 'block';
    }
}

window.closeUserModal = function() {
    document.getElementById('userModal').style.display = 'none';
}

// Google Maps for route visualization
let map;
let directionsService;
let directionsRenderers = [];

window.initAdminMap = function() {
    if (typeof google === 'undefined' || !google.maps) {
        console.log('Google Maps API not yet loaded');
        return;
    }
    
    try {
        directionsService = new google.maps.DirectionsService();
        console.log('Google Maps initialized for admin dashboard');
    } catch (error) {
        console.error('Error initializing Google Maps:', error);
    }
}

let selectedRoutes = [];
let allRouteBookings = [];

async function loadRoutesMap() {
    const result = await getAllBookings();
    
    if (!result.success) {
        notify.error('Greška pri učitavanju ruta');
        return;
    }
    
    // Get status filter value
    const statusFilter = document.getElementById('routeStatusFilter')?.value || 'all';
    
    // Filter out cancelled bookings and only show transport with from/to
    let bookings = result.bookings.filter(b => 
        b.from && 
        b.to && 
        b.serviceCategory === 'transport' && 
        b.status !== 'cancelled'
    );
    
    // Apply status filter
    if (statusFilter !== 'all') {
        bookings = bookings.filter(b => b.status === statusFilter);
    }
    
    allRouteBookings = bookings;
    
    if (bookings.length === 0) {
        document.getElementById('routesList').innerHTML = '<p class="no-data">Nema dostupnih ruta za prikaz</p>';
        return;
    }
    
    // Initialize map
    const mapDiv = document.getElementById('routesMap');
    if (!map) {
        map = new google.maps.Map(mapDiv, {
            zoom: 7,
            center: { lat: 45.8150, lng: 15.9819 }, // Croatia center
            mapTypeControl: true,
            streetViewControl: false,
            mapId: '6d85f719dc2c8d13578b742f'
        });
    }
    
    // Clear previous routes
    directionsRenderers.forEach(renderer => renderer.setMap(null));
    directionsRenderers = [];
    
    // Display routes
    const routesList = document.getElementById('routesList');
    routesList.innerHTML = '';
    
    bookings.forEach((booking, index) => {
        const isSelected = selectedRoutes.includes(booking.id);
        const color = isSelected ? '#e31e24' : '#1e5ba8'; // Red if selected, blue otherwise
        
        // Get Croatian service name
        const serviceName = getServiceNameCroatian(booking.service);
        
        // Shorten addresses for display
        const fromShort = booking.from.split(',')[0];
        const toShort = booking.to.split(',')[0];
        
        // Create route card
        const routeCard = document.createElement('div');
        routeCard.className = 'route-card';
        routeCard.style.borderLeft = `4px solid ${color}`;
        routeCard.style.cursor = 'pointer';
        routeCard.style.background = isSelected ? 'rgba(227, 30, 36, 0.05)' : 'white';
        routeCard.setAttribute('data-booking-id', booking.id);
        
        routeCard.innerHTML = `
            <div class="route-header">
                <h4 style="font-size: 1rem; margin-bottom: 5px;">${serviceName}</h4>
                <span class="booking-status ${booking.status}">${getStatusText(booking.status)}</span>
            </div>
            <div class="route-summary" style="font-size: 0.9rem; color: #666; margin: 8px 0;">
                <strong>Od:</strong> ${fromShort} → <strong>Do:</strong> ${toShort}
            </div>
            <div class="route-actions" style="display: flex; gap: 10px; margin-top: 10px;">
                <button class="btn-small" onclick="event.stopPropagation(); toggleRouteSelection('${booking.id}')" style="flex: 1; padding: 6px 12px; font-size: 0.85rem; background: ${isSelected ? '#e31e24' : '#1e5ba8'}; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    <i class="fas fa-${isSelected ? 'check' : 'plus'}"></i> ${isSelected ? 'Odabrano' : 'Odaberi'}
                </button>
                <button class="btn-small" onclick="event.stopPropagation(); viewBooking('${booking.id}')" style="padding: 6px 12px; font-size: 0.85rem; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    <i class="fas fa-eye"></i> Detalji
                </button>
            </div>
        `;
        routesList.appendChild(routeCard);
        
        // Draw route on map with clickable polyline
        const directionsRenderer = new google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: false,
            polylineOptions: {
                strokeColor: color,
                strokeWeight: isSelected ? 7 : 5,
                strokeOpacity: isSelected ? 1 : 0.6,
                clickable: true
            },
            preserveViewport: index > 0
        });
        
        directionsRenderers.push(directionsRenderer);
        
        directionsService.route({
            origin: booking.from,
            destination: booking.to,
            travelMode: google.maps.TravelMode.DRIVING
        }, (response, status) => {
            if (status === 'OK') {
                directionsRenderer.setDirections(response);
                
                // Add click listener to polyline
                google.maps.event.addListener(directionsRenderer, 'directions_changed', function() {
                    const directions = directionsRenderer.getDirections();
                    if (directions) {
                        const polyline = directionsRenderer.getDirections().routes[0].overview_path;
                        
                        // Create invisible clickable overlay
                        const routePath = new google.maps.Polyline({
                            path: polyline,
                            strokeColor: color,
                            strokeWeight: 10,
                            strokeOpacity: 0,
                            map: map,
                            clickable: true
                        });
                        
                        routePath.addListener('click', () => {
                            viewBooking(booking.id);
                        });
                    }
                });
            } else {
                console.error('Directions request failed:', status);
            }
        });
    });
}

// Get Croatian service name
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
    return serviceNames[service] || service || 'Transport';
}

// Toggle route selection
window.toggleRouteSelection = function(bookingId) {
    const index = selectedRoutes.indexOf(bookingId);
    if (index > -1) {
        selectedRoutes.splice(index, 1);
    } else {
        selectedRoutes.push(bookingId);
    }
    
    // Reload map to update colors
    loadRoutesMap();
    
    // Show optimization button if multiple routes selected
    updateOptimizationButton();
}

function updateOptimizationButton() {
    let optimizeBtn = document.getElementById('optimizeRoutesBtn');
    
    if (selectedRoutes.length > 1) {
        if (!optimizeBtn) {
            optimizeBtn = document.createElement('button');
            optimizeBtn.id = 'optimizeRoutesBtn';
            optimizeBtn.className = 'btn-primary';
            optimizeBtn.style.cssText = 'margin: 20px 0; padding: 12px 24px; width: 100%; font-size: 1rem;';
            optimizeBtn.innerHTML = `<i class="fas fa-route"></i> Optimiziraj ${selectedRoutes.length} Ruta`;
            optimizeBtn.onclick = optimizeSelectedRoutes;
            
            const routesList = document.getElementById('routesList');
            routesList.insertBefore(optimizeBtn, routesList.firstChild);
        } else {
            optimizeBtn.innerHTML = `<i class="fas fa-route"></i> Optimiziraj ${selectedRoutes.length} Ruta`;
        }
    } else if (optimizeBtn) {
        optimizeBtn.remove();
    }
}

function optimizeSelectedRoutes() {
    if (selectedRoutes.length < 2) return;
    
    const selectedBookings = allRouteBookings.filter(b => selectedRoutes.includes(b.id));
    const routeNames = selectedBookings.map(b => getServiceNameCroatian(b.service)).join(', ');
    
    notify.success(`Optimizacija rute za: ${routeNames}`);
    
    // Clear previous routes and show only selected ones
    directionsRenderers.forEach(renderer => renderer.setMap(null));
    directionsRenderers = [];
    
    // Create waypoints for multi-stop route
    const waypoints = [];
    selectedBookings.forEach(booking => {
        waypoints.push({
            location: booking.from,
            stopover: true
        });
        waypoints.push({
            location: booking.to,
            stopover: true
        });
    });
    
    // Calculate optimized route
    const directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: false,
        polylineOptions: {
            strokeColor: '#e31e24',
            strokeWeight: 6,
            strokeOpacity: 0.8
        }
    });
    
    directionsRenderers.push(directionsRenderer);
    
    directionsService.route({
        origin: selectedBookings[0].from,
        destination: selectedBookings[selectedBookings.length - 1].to,
        waypoints: waypoints.slice(2, -2), // Remove first origin and last destination
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING
    }, (response, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);
            
            const route = response.routes[0];
            const distance = route.legs.reduce((sum, leg) => sum + leg.distance.value, 0) / 1000;
            const duration = route.legs.reduce((sum, leg) => sum + leg.duration.value, 0) / 60;
            
            notify.success(`Optimizirana ruta: ${distance.toFixed(1)} km, ${Math.round(duration)} min`);
        } else {
            console.error('Route optimization failed:', status);
            notify.error('Greška pri optimizaciji rute');
        }
    });
}

document.getElementById('routeStatusFilter')?.addEventListener('change', (e) => {
    const status = e.target.value;
    selectedRoutes = []; // Clear selection when filter changes
    loadRoutesMap();
});

window.viewBooking = function(bookingId) {
    const booking = allBookings.find(b => b.id === bookingId);
    if (!booking) return;

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
            <div class="detail-value">${getUserName(booking.userId)}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Kategorija:</div>
            <div class="detail-value">${getServiceName(booking.serviceCategory)}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Usluga:</div>
            <div class="detail-value">${getServiceNameCroatian(booking.service)}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Datum & Vrijeme:</div>
            <div class="detail-value">${booking.date} ${booking.time}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Lokacija:</div>
            <div class="detail-value">${booking.from}${booking.to ? ' → ' + booking.to : ''}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Opis Usluge:</div>
            <div class="detail-value">${booking.serviceDescription || '-'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Približna Težina:</div>
            <div class="detail-value">${booking.approxWeight ? booking.approxWeight + ' kg' : '-'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Napomene:</div>
            <div class="detail-value">${booking.notes || '-'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Status:</div>
            <div class="detail-value"><span class="status-badge ${booking.status}">${getStatusText(booking.status)}</span></div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Kreirano:</div>
            <div class="detail-value">${formatDate(booking.createdAt)}</div>
        </div>
    `;

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
    
    if (!confirm('Jeste li sigurni da želite prihvatiti ovu rezervaciju? Korisniku će biti poslan email.')) {
        return;
    }
    
    try {
        const { doc, updateDoc, db } = await import('./firebase-config.js');
        
        await updateDoc(doc(db, 'bookings', currentBookingId), {
            status: 'confirmed'
        });
        
        notify.success('Rezervacija prihvaćena! Email poslan korisniku.');
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
    
    const reason = prompt('Unesite razlog odbijanja (bit će poslan korisniku):');
    if (!reason) return;
    
    try {
        const { doc, updateDoc, db } = await import('./firebase-config.js');
        
        await updateDoc(doc(db, 'bookings', currentBookingId), {
            status: 'cancelled',
            cancellationReason: reason,
            cancelledBy: 'admin'
        });
        
        notify.success('Rezervacija odbijena! Email poslan korisniku.');
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

    const result = await updateBookingStatus(currentBookingId, newStatus);

    if (result.success) {
        notify.success('Status uspješno ažuriran!');
        document.getElementById('bookingModal').style.display = 'none';
        loadBookings();
        loadOverview();
    } else {
        notify.error(result.message || 'Greška pri ažuriranju statusa');
    }
}

function confirmDeleteBooking(bookingId) {
    notify.confirmDelete(
        'Jeste li sigurni da želite obrisati ovu rezervaciju?',
        'Potvrda brisanja',
        () => deleteBookingById(bookingId)
    );
}

async function deleteBookingConfirm() {
    if (!currentBookingId) return;
    notify.confirmDelete(
        'Jeste li sigurni da želite obrisati ovu rezervaciju?',
        'Potvrda brisanja',
        async () => {
            await deleteBookingById(currentBookingId);
            document.getElementById('bookingModal').style.display = 'none';
        }
    );
}

async function deleteBookingById(bookingId) {
    const result = await deleteBooking(bookingId);

    if (result.success) {
        notify.success('Rezervacija uspješno obrisana!');
        loadBookings();
        loadOverview();
    } else {
        notify.error(result.message || 'Greška pri brisanju rezervacije');
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
    return user ? user.name : 'Nepoznat korisnik';
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
        confirmed: 'Potvrđeno',
        completed: 'Završeno',
        cancelled: 'Otkazano'
    };
    return statusTexts[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
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

function generateMonthlyReport() {
    notify.info('Mjesečni izvještaj će biti generiran...', 'Izvještaj');
}

function generateYearlyReport() {
    notify.info('Godišnji izvještaj će biti generiran...', 'Izvještaj');
}

function generateUsersReport() {
    notify.info('Izvještaj korisnika će biti generiran...', 'Izvještaj');
}

function generateCustomReport() {
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    
    if (!startDate || !endDate) {
        notify.warning('Molimo odaberite datume');
        return;
    }
    
    notify.info(`Prilagođeni izvještaj od ${startDate} do ${endDate} će biti generiran...`, 'Izvještaj');
}

function saveWorkingHours() {
    const start = document.getElementById('workStart').value;
    const end = document.getElementById('workEnd').value;
    notify.success(`Radno vrijeme spremljeno: ${start} - ${end}`);
}

function changeAdminPassword() {
    notify.info('Funkcionalnost promjene lozinke će biti implementirana uskoro.', 'Promjena Lozinke');
}

loadOverview();
