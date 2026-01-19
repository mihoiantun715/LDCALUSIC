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

function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">Nema korisnika</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => {
        const userBookings = allBookings.filter(b => b.userId === user.id).length;
        return `
            <tr>
                <td>#${user.id.slice(-6)}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone || '-'}</td>
                <td>${formatDate(user.createdAt)}</td>
                <td>${userBookings}</td>
                <td>
                    <button class="action-btn btn-view" onclick="viewUserDetails('${user.id}')">
                        <i class="fas fa-eye"></i>
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

function viewBooking(bookingId) {
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
            <div class="detail-value">${booking.service}</div>
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

    document.getElementById('modalStatusSelect').value = booking.status;
    modal.style.display = 'block';
}

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
