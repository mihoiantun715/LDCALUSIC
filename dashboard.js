// Import Firebase auth functions
import { checkAuthState, getCurrentUser, createBooking, getUserBookings, cancelBooking, logoutUser, updateUserEmail, sendPasswordReset } from './firebase-auth.js';

const dashTranslations = {
    hr: {
        dash_new_booking: "Nova Rezervacija",
        dash_my_bookings: "Moje Rezervacije",
        dash_profile: "Profil",
        dash_select_service: "Odaberite vrstu usluge i ispunite podatke",
        tab_transport: "Prijevoz i Dostava sa Instalacijom",
        tab_cleaning: "Čišćenje",
        tab_garden: "Održavanje Zelenih Površina",
        tab_rental: "Najam Opreme",
        transport_title: "Prijevoz i Dostava sa Instalacijom - Odaberite Uslugu",
        trans_vehicles: "Prijevoz motornih vozila",
        trans_vehicles_desc: "Transport automobila, motocikala i drugih vozila",
        trans_furniture: "Namještaj i kućanski aparati",
        trans_furniture_desc: "Dostava namještaja i kućanskih aparata",
        trans_cargo: "Paletirana i rasuti teret",
        trans_cargo_desc: "Transport paletiranog i rasutog tereta",
        trans_install: "Instalacija i deinstalacija aparata",
        trans_install_desc: "Ugradnja i odvoz starih kućanskih aparata",
        trans_assembly: "Dostava i ugradnja namještaja",
        trans_assembly_desc: "Sastavljanje manjih kuhinja i namještaja",
        trans_fitness: "Fitness aparati",
        trans_fitness_desc: "Dostava i sastavljanje fitness opreme",
        trans_general: "Transport robe po RH",
        trans_general_desc: "Sve vrste neopasnog tereta diljem Hrvatske",
        trans_moving: "Selidbe po EU",
        trans_moving_desc: "Međunarodne selidbe po cijeloj Europi",
        trans_clearing: "Pražnjenje prostora",
        trans_clearing_desc: "Pražnjenje poslovnih i stambenih prostora",
        trans_waste: "Odvoz otpada",
        trans_waste_desc: "Odvoz starih aparata i neopasnog otpada",
        cleaning_title: "Usluge Čišćenja - Odaberite Uslugu",
        clean_general: "Opće čišćenje prostora",
        clean_general_desc: "Osnovno čišćenje prostorija",
        clean_regular: "Redovito čišćenje",
        clean_regular_desc: "Redovito čišćenje uredskih i stambenih prostora",
        clean_deep: "Dubinsko čišćenje",
        clean_deep_desc: "Generalno čišćenje nakon renovacije ili selidbe",
        clean_floors: "Čišćenje podova",
        clean_floors_desc: "Usisavanje, pranje i poliranje podova",
        clean_disinfect: "Dezinfekcija",
        clean_disinfect_desc: "Dezinfekcija sanitarnih čvorova i kuhinja",
        clean_windows: "Pranje prozora",
        clean_windows_desc: "Pranje unutarnjih i vanjskih stakala",
        clean_glass: "Čišćenje staklenih površina",
        clean_glass_desc: "Izlozi, staklena vrata i fasade",
        clean_balcony: "Balkonske ograde",
        clean_balcony_desc: "Pranje staklenih fasada i balkonskih ograda",
        clean_stains: "Uklanjanje tvrdokornih mrlja",
        clean_stains_desc: "Vapno, cement, ljepilo sa stakla",
        clean_frames: "Okviri i rolete",
        clean_frames_desc: "Čišćenje okvira, roleta i prozorskih klupica",
        garden_title: "Održavanje Zelenih Površina",
        garden_mowing: "Košnja travnjaka",
        garden_mowing_desc: "Redovno održavanje travnjaka",
        garden_trees: "Rezidba stabala",
        garden_trees_desc: "Rezidba i sanacija stabala",
        garden_hedges: "Formiranje živica",
        garden_hedges_desc: "Rezidba i formiranje živica i grmova",
        garden_planting: "Sadnja bilja",
        garden_planting_desc: "Sadnja cvijeća i ukrasnog bilja",
        rental_title: "Najam Opreme",
        rental_fridge: "Frižider za zabave",
        rental_fridge_desc: "Najam frižidera za događaje",
        rental_tractor: "Traktor kosilica",
        rental_tractor_desc: "Najam traktora kosilice",
        rental_van: "Kombi 3,5t",
        rental_van_desc: "Najam kombi vozila",
        tab_special: "Specijalne Usluge",
        special_title: "Specijalne Usluge",
        special_commercial: "Čišćenje poslovnih objekata",
        special_commercial_desc: "Čišćenje poslovnih objekata i industrijskih hala",
        special_construction: "Čišćenje nakon građevinskih radova",
        special_construction_desc: "Profesionalno čišćenje nakon renovacije i gradnje",
        special_common: "Zajednički prostori u zgradama",
        special_common_desc: "Čišćenje i dezinfekcija zajedničkih prostora",
        special_outdoor: "Čišćenje vanjskih površina",
        special_outdoor_desc: "Dvorišta, prilazi i vanjski prostori",
        special_events: "Održavanje čistoće na događanjima",
        special_events_desc: "Čišćenje prije, tijekom i nakon događaja",
        booking_details: "Detalji Rezervacije",
        form_date: "Datum",
        form_time: "Vrijeme",
        form_from: "Polazište",
        form_to: "Odredište",
        form_fixed_location: "Lokacija",
        form_exact_service: "Točan opis usluge",
        form_weight: "Približna težina (kg)",
        form_message: "Dodatne informacije",
        form_submit: "Pošalji zahtjev",
        no_bookings: "Nemate aktivnih rezervacija.",
        form_name: "Ime i prezime",
        form_email: "Email",
        form_phone: "Telefon"
    },
    en: {
        dash_new_booking: "New Booking",
        dash_my_bookings: "My Bookings",
        dash_profile: "Profile",
        dash_select_service: "Select service type and fill in the details",
        tab_transport: "Transport & Delivery with Installation",
        tab_cleaning: "Cleaning",
        tab_garden: "Green Area Maintenance",
        tab_rental: "Equipment Rental",
        transport_title: "Transport & Delivery with Installation - Select Service",
        trans_vehicles: "Motor vehicle transport",
        trans_vehicles_desc: "Transport of cars, motorcycles and other vehicles",
        trans_furniture: "Furniture and appliances",
        trans_furniture_desc: "Delivery of furniture and household appliances",
        trans_cargo: "Palletized and bulk cargo",
        trans_cargo_desc: "Transport of palletized and bulk cargo",
        trans_install: "Appliance installation",
        trans_install_desc: "Installation and removal of old household appliances",
        trans_assembly: "Furniture delivery and assembly",
        trans_assembly_desc: "Assembly of small kitchens and furniture",
        trans_fitness: "Fitness equipment",
        trans_fitness_desc: "Delivery and assembly of fitness equipment",
        trans_general: "Cargo transport in Croatia",
        trans_general_desc: "All types of non-hazardous cargo throughout Croatia",
        trans_moving: "EU relocations",
        trans_moving_desc: "International relocations throughout Europe",
        trans_clearing: "Space clearing",
        trans_clearing_desc: "Clearing of commercial and residential spaces",
        trans_waste: "Waste disposal",
        trans_waste_desc: "Disposal of old appliances and non-hazardous waste",
        cleaning_title: "Cleaning Services - Select Service",
        clean_general: "General space cleaning",
        clean_general_desc: "Basic room cleaning",
        clean_regular: "Regular cleaning",
        clean_regular_desc: "Regular cleaning of office and residential spaces",
        clean_deep: "Deep cleaning",
        clean_deep_desc: "General cleaning after renovation or relocation",
        clean_floors: "Floor cleaning",
        clean_floors_desc: "Vacuuming, washing and polishing floors",
        clean_disinfect: "Disinfection",
        clean_disinfect_desc: "Disinfection of bathrooms and kitchens",
        clean_windows: "Window washing",
        clean_windows_desc: "Washing interior and exterior glass",
        clean_glass: "Glass surface cleaning",
        clean_glass_desc: "Storefronts, glass doors and facades",
        clean_balcony: "Balcony railings",
        clean_balcony_desc: "Washing glass facades and balcony railings",
        clean_stains: "Stubborn stain removal",
        clean_stains_desc: "Lime, cement, glue from glass",
        clean_frames: "Frames and shutters",
        clean_frames_desc: "Cleaning frames, shutters and window sills",
        garden_title: "Green Area Maintenance",
        garden_mowing: "Lawn mowing",
        garden_mowing_desc: "Regular lawn maintenance",
        garden_trees: "Tree trimming",
        garden_trees_desc: "Tree trimming and rehabilitation",
        garden_hedges: "Hedge shaping",
        garden_hedges_desc: "Trimming and shaping hedges and shrubs",
        garden_planting: "Plant planting",
        garden_planting_desc: "Planting flowers and ornamental plants",
        rental_title: "Equipment Rental",
        rental_fridge: "Party refrigerator",
        rental_fridge_desc: "Refrigerator rental for events",
        rental_tractor: "Tractor mower",
        rental_tractor_desc: "Tractor mower rental",
        rental_van: "Van 3.5t",
        rental_van_desc: "Van rental",
        tab_special: "Special Services",
        special_title: "Special Services",
        special_commercial: "Commercial facility cleaning",
        special_commercial_desc: "Cleaning of commercial buildings and industrial halls",
        special_construction: "Post-construction cleaning",
        special_construction_desc: "Professional cleaning after renovation and construction",
        special_common: "Common areas in buildings",
        special_common_desc: "Cleaning and disinfection of common areas",
        special_outdoor: "Outdoor surface cleaning",
        special_outdoor_desc: "Yards, driveways and outdoor spaces",
        special_events: "Event cleaning maintenance",
        special_events_desc: "Cleaning before, during and after events",
        booking_details: "Booking Details",
        form_date: "Date",
        form_time: "Time",
        form_from: "From",
        form_to: "To",
        form_fixed_location: "Location",
        form_exact_service: "Exact service description",
        form_weight: "Approximate weight (kg)",
        form_message: "Additional Information",
        form_submit: "Submit Request",
        no_bookings: "You have no active bookings.",
        form_name: "Full Name",
        form_email: "Email",
        form_phone: "Phone"
    }
};

let currentDashLang = 'hr';

function translateDashboard(lang) {
    currentDashLang = lang;
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (dashTranslations[lang][key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = dashTranslations[lang][key];
            } else {
                element.textContent = dashTranslations[lang][key];
            }
        }
    });
    
    document.documentElement.lang = lang;
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
}

document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        translateDashboard(lang);
    });
});

// Check authentication state
let currentUser = null;

checkAuthState(async (user) => {
    if (user) {
        currentUser = user;
        // Load user data from Firestore
        const { getDoc, doc, db } = await import('./firebase-config.js');
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            document.getElementById('userName').textContent = userData.name;
            document.getElementById('profileName').textContent = userData.name;
            document.getElementById('profileEmail').textContent = userData.email || '-';
            document.getElementById('profilePhone').textContent = userData.phone || '-';
        }
    } else {
        // Not authenticated, redirect to home
        window.location.href = 'index.html';
    }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    const result = await logoutUser();
    if (result.success) {
        window.location.href = 'index.html';
    }
});

// Change email functionality
document.getElementById('changeEmailBtn').addEventListener('click', () => {
    notify.confirm(
        'Unesite novu email adresu i trenutnu lozinku za potvrdu:',
        'Promjena Email Adrese',
        async () => {
            const newEmail = prompt('Nova email adresa:');
            if (!newEmail) return;
            
            const password = prompt('Trenutna lozinka za potvrdu:');
            if (!password) return;
            
            const result = await updateUserEmail(newEmail, password);
            
            if (result.success) {
                notify.success(result.message);
                document.getElementById('profileEmail').textContent = newEmail;
            } else {
                notify.error(result.message);
            }
        }
    );
});

// Change password functionality
document.getElementById('changePasswordBtn').addEventListener('click', () => {
    notify.confirm(
        'Poslat ćemo vam link za resetiranje lozinke na vašu email adresu.',
        'Promjena Lozinke',
        async () => {
            const user = getCurrentUser();
            if (!user) {
                notify.error('Korisnik nije prijavljen');
                return;
            }
            
            const result = await sendPasswordReset(user.email);
            
            if (result.success) {
                notify.success(result.message + '. Provjerite inbox i spam folder.');
            } else {
                notify.error(result.message);
            }
        }
    );
});

document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.getAttribute('data-section');
        
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        document.getElementById(section).classList.add('active');
        
        if (section === 'my-bookings') {
            loadBookings();
        }
    });
});

document.querySelectorAll('.service-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const service = tab.getAttribute('data-service');
        
        document.querySelectorAll('.service-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        document.querySelectorAll('.service-options').forEach(opt => {
            opt.style.display = 'none';
        });
        
        document.getElementById(service + 'Options').style.display = 'block';
        
        toggleLocationFields(service);
    });
});

function toggleLocationFields(serviceType) {
    const transportRow = document.getElementById('transportLocationRow');
    const fixedRow = document.getElementById('fixedLocationRow');
    const fromInput = document.getElementById('locationFrom');
    const toInput = document.getElementById('locationTo');
    const fixedInput = document.getElementById('fixedLocation');
    
    if (serviceType === 'transport') {
        transportRow.style.display = 'flex';
        fixedRow.style.display = 'none';
        fromInput.required = true;
        fixedInput.required = false;
        fixedInput.value = '';
    } else {
        transportRow.style.display = 'none';
        fixedRow.style.display = 'flex';
        fromInput.required = false;
        fixedInput.required = true;
        fromInput.value = '';
        toInput.value = '';
    }
}

document.getElementById('bookingFormDetailed').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const activeTab = document.querySelector('.service-tab.active').getAttribute('data-service');
    let selectedService = '';
    let serviceCategory = '';
    
    if (activeTab === 'transport') {
        selectedService = document.querySelector('input[name="transportService"]:checked')?.value;
        serviceCategory = 'transport';
    } else if (activeTab === 'cleaning') {
        selectedService = document.querySelector('input[name="cleaningService"]:checked')?.value;
        serviceCategory = 'cleaning';
    } else if (activeTab === 'garden') {
        selectedService = document.querySelector('input[name="gardenService"]:checked')?.value;
        serviceCategory = 'garden';
    } else if (activeTab === 'rental') {
        selectedService = document.querySelector('input[name="rentalService"]:checked')?.value;
        serviceCategory = 'rental';
    } else if (activeTab === 'special') {
        selectedService = document.querySelector('input[name="specialService"]:checked')?.value;
        serviceCategory = 'special';
    }
    
    if (!selectedService) {
        notify.warning(currentDashLang === 'hr' ? 'Molimo odaberite uslugu' : 'Please select a service');
        return;
    }
    
    const isTransport = (serviceCategory === 'transport');
    
    const bookingData = {
        serviceCategory: serviceCategory,
        service: selectedService,
        date: document.getElementById('bookingDate').value,
        time: document.getElementById('bookingTime').value,
        from: isTransport ? document.getElementById('locationFrom').value : document.getElementById('fixedLocation').value,
        to: isTransport ? document.getElementById('locationTo').value : '',
        serviceDescription: document.getElementById('serviceDescription').value,
        approxWeight: document.getElementById('approxWeight').value,
        notes: document.getElementById('bookingNotes').value
    };
    
    const result = await createBooking(bookingData);
    
    if (result.success) {
        notify.success(currentDashLang === 'hr' ? 'Rezervacija uspješno poslana!' : 'Booking sent successfully!');
        document.getElementById('bookingFormDetailed').reset();
        document.querySelectorAll('.service-tab').forEach(t => t.classList.remove('active'));
        document.querySelector('.service-tab').classList.add('active');
        document.querySelectorAll('.service-options').forEach(opt => opt.style.display = 'none');
        document.getElementById('transportOptions').style.display = 'block';
    } else {
        notify.error(result.message || (currentDashLang === 'hr' ? 'Greška pri slanju rezervacije' : 'Booking error'));
    }
});

async function loadBookings() {
    const result = await getUserBookings();
    const bookingsList = document.getElementById('bookingsList');
    
    if (!result.success) {
        bookingsList.innerHTML = `<p class="no-bookings">${result.message}</p>`;
        return;
    }
    
    const bookings = result.bookings;
    
    if (bookings.length === 0) {
        bookingsList.innerHTML = `<p class="no-bookings" data-translate="no_bookings">${currentDashLang === 'hr' ? 'Nemate aktivnih rezervacija.' : 'You have no active bookings.'}</p>`;
        return;
    }
    
    bookingsList.innerHTML = bookings.map(booking => `
        <div class="booking-card">
            <div class="booking-header">
                <h3>${getServiceName(booking.service || booking.serviceCategory)}</h3>
                <span class="booking-status ${booking.status}">${getStatusText(booking.status)}</span>
            </div>
            <div class="booking-details">
                <div class="booking-detail">
                    <i class="fas fa-calendar"></i>
                    <span>${booking.date} ${booking.time || ''}</span>
                </div>
                <div class="booking-detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${booking.from} ${booking.to ? '→ ' + booking.to : ''}</span>
                </div>
            </div>
            ${booking.notes ? `<p style="margin-top: 15px; color: var(--text-light);"><strong>Napomena:</strong> ${booking.notes}</p>` : ''}
            ${booking.status !== 'cancelled' && booking.status !== 'completed' ? `
                <button class="cancel-booking-btn" data-booking-id="${booking.id}" style="margin-top: 15px; background: #dc3545; color: white; padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer;">
                    <i class="fas fa-times"></i> ${currentDashLang === 'hr' ? 'Otkaži Rezervaciju' : 'Cancel Booking'}
                </button>
            ` : ''}
        </div>
    `).join('');
    
    // Add cancel button event listeners
    document.querySelectorAll('.cancel-booking-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const bookingId = e.target.closest('.cancel-booking-btn').getAttribute('data-booking-id');
            const confirmMsg = currentDashLang === 'hr' ? 
                'Jeste li sigurni da želite otkazati ovu rezervaciju?' : 
                'Are you sure you want to cancel this booking?';
            
            if (confirm(confirmMsg)) {
                const result = await cancelBooking(bookingId);
                if (result.success) {
                    notify.success(currentDashLang === 'hr' ? 'Rezervacija otkazana' : 'Booking cancelled');
                    loadBookings();
                } else {
                    notify.error(result.message);
                }
            }
        });
    });
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
        pending: currentDashLang === 'hr' ? 'Na čekanju' : 'Pending',
        confirmed: currentDashLang === 'hr' ? 'Potvrđeno' : 'Confirmed',
        completed: currentDashLang === 'hr' ? 'Završeno' : 'Completed'
    };
    return statusTexts[status] || status;
}

const today = new Date().toISOString().split('T')[0];
document.getElementById('bookingDate').setAttribute('min', today);
