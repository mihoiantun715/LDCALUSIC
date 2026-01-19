// Import Firebase auth functions
import { loginUser, registerUser, createPublicBooking, loginWithGoogle } from './firebase-auth.js';
import { functions, httpsCallable } from './firebase-config.js';

// Smooth scroll navigation without hash
document.querySelectorAll('.nav-link, .cta-button').forEach(link => {
    link.addEventListener('click', (e) => {
        const section = link.getAttribute('data-section');
        if (section) {
            e.preventDefault();
            const targetElement = document.getElementById(section);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
});

const translations = {
    hr: {
        nav_home: "Početna",
        nav_services: "Usluge",
        nav_about: "O nama",
        nav_booking: "Rezervacija",
        nav_contact: "Kontakt",
        auth_account: "Račun",
        auth_login: "Prijava",
        auth_register: "Registracija",
        hero_title: "Prijevoz, Čišćenje i Održavanje",
        hero_subtitle: "Profesionalne usluge diljem Slavonije",
        hero_transport: "Prijevoz i Dostava sa Instalacijom",
        hero_cleaning: "Čišćenje Prostora",
        hero_garden: "Održavanje Zelenih Površina",
        hero_cta: "Rezerviraj sada",
        services_title: "Naše Usluge",
        services_subtitle: "Sveobuhvatne usluge za privatne i poslovne korisnike",
        service1_title: "Prijevoz i Dostava sa Instalacijom",
        service1_desc: "Dostava kućanskih aparata s ugradnjom, transport tereta, selidbe po EU, odvoz otpada",
        service2_title: "Čišćenje Prostora",
        service2_desc: "Redovito i dubinsko čišćenje, pranje prozora, dezinfekcija, čišćenje nakon renovacije",
        service3_title: "Održavanje Zelenih Površina",
        service3_desc: "Košnja travnjaka, rezidba stabala i živica, hortikultura, zimska služba",
        service4_title: "Specijalne Usluge",
        service4_desc: "Čišćenje poslovnih objekata, industrijskih hala, građevinskih radova i događanja",
        service5_title: "Najam Opreme",
        service5_desc: "Najam frižidera za zabave, traktor kosilice i kombi vozila 3,5t",
        about_title: "O nama",
        about_p1: "LD Čalušić Usluge je obrt osnovan 2025. godine, specijaliziran za prijevoz svih vrsta tereta, odvoz električnog i glomaznog otpada te dostavu kućanskih uređaja s ugradnjom i priključkom.",
        about_p2: "S više od 7 godina iskustva u dostavi i montaži kućanskih aparata, nudimo pouzdanu i profesionalnu uslugu diljem Slavonije. Uz prijevoz, imamo višegodišnje iskustvo u čišćenju poslovnih i stambenih zgrada te održavanju zelenih javnih i privatnih površina.",
        about_p3: "Naš tim stručnjaka osigurava brzu i kvalitetnu uslugu za sve vaše potrebe.",
        feature1: "Besplatni izlazak i ponuda",
        feature2: "Sve kategorije vozačke dozvole",
        feature3: "Dozvola za odvoz otpada",
        feature4: "Brze intervencije - Servis 48h",
        booking_title: "Rezervirajte uslugu",
        booking_subtitle: "Ispunite formu i kontaktirat ćemo vas u najkraćem roku",
        form_name: "Ime i prezime",
        form_email: "Email",
        form_phone: "Telefon",
        form_service: "Vrsta usluge",
        form_select: "Odaberite uslugu",
        form_transport: "Prijevoz i Dostava sa Instalacijom",
        form_cleaning: "Čišćenje Prostora",
        form_garden: "Održavanje Zelenih Površina",
        form_rental: "Najam Opreme",
        form_special: "Specijalne Usluge",
        form_from: "Polazište",
        form_to: "Odredište",
        form_location: "Lokacija",
        form_date: "Datum",
        form_time: "Vrijeme",
        form_message: "Dodatne informacije",
        form_submit: "Pošalji zahtjev",
        phone_valid: "Broj telefona je validan",
        phone_invalid: "Unesite validan broj telefona (7-15 znamenki)",
        verify_email: "Pošalji verifikacijski kod",
        verification_code: "Verifikacijski kod",
        code_sent: "Kod poslan",
        code_invalid: "Neispravan kod",
        code_verified: "Kod potvrđen",
        verify_code_btn: "Potvrdi kod",
        enter_code: "Unesite 6-znamenkasti kod",
        distance_label: "Udaljenost",
        contact_title: "Kontaktirajte nas",
        contact_phone: "Telefon",
        contact_owner: "Vlasnik",
        contact_address: "Adresa",
        contact_email: "Email",
        footer_desc: "Usluge i prijevoz diljem Slavonije",
        footer_links: "Brzi linkovi",
        footer_follow: "Pratite nas",
        footer_rights: "Sva prava pridržana.",
        login_title: "Prijava",
        login_password: "Lozinka",
        register_title: "Registracija"
    },
    en: {
        nav_home: "Home",
        nav_services: "Services",
        nav_about: "About",
        nav_booking: "Booking",
        nav_contact: "Contact",
        auth_account: "Account",
        auth_login: "Login",
        auth_register: "Register",
        hero_title: "Transport, Cleaning & Maintenance",
        hero_subtitle: "Professional services across Slavonia",
        hero_transport: "Transport & Delivery",
        hero_cleaning: "Space Cleaning",
        hero_garden: "Green Area Maintenance",
        hero_cta: "Book now",
        services_title: "Our Services",
        services_subtitle: "Comprehensive services for private and business clients",
        service1_title: "Transport & Delivery with Installation",
        service1_desc: "Delivery of household appliances with installation, cargo transport, EU relocations, waste disposal",
        service2_title: "Space Cleaning",
        service2_desc: "Regular and deep cleaning, window washing, disinfection, post-renovation cleaning",
        service3_title: "Green Area Maintenance",
        service3_desc: "Lawn mowing, tree and hedge trimming, horticulture, winter service",
        service4_title: "Special Services",
        service4_desc: "Cleaning of commercial facilities, industrial halls, construction sites and events",
        service5_title: "Equipment Rental",
        service5_desc: "Rental of refrigerators for parties, tractor mowers and 3.5t vans",
        about_title: "About Us",
        about_p1: "LD Čalušić Services is a business founded in 2025, specialized in transport of all types of cargo, disposal of electrical and bulky waste, and delivery of household appliances with installation and connection.",
        about_p2: "With over 7 years of experience in delivery and installation of household appliances, we offer reliable and professional service throughout Slavonia. In addition to transport, we have years of experience in cleaning commercial and residential buildings and maintaining green public and private areas.",
        about_p3: "Our team of experts ensures fast and quality service for all your needs.",
        feature1: "Free visit and quote",
        feature2: "All driving license categories",
        feature3: "Waste disposal permit",
        feature4: "Fast interventions - 48h Service",
        booking_title: "Book a Service",
        booking_subtitle: "Fill out the form and we will contact you shortly",
        form_name: "Full Name",
        form_email: "Email",
        form_phone: "Phone",
        form_service: "Service Type",
        form_select: "Select service",
        form_transport: "Transport & Delivery with Installation",
        form_cleaning: "Cleaning Services",
        form_garden: "Garden Maintenance",
        form_rental: "Equipment Rental",
        form_special: "Special Services",
        form_from: "From",
        form_to: "To",
        form_location: "Location",
        form_date: "Date",
        form_time: "Time",
        form_message: "Additional Information",
        form_submit: "Submit Request",
        phone_valid: "Phone number is valid",
        phone_invalid: "Enter a valid phone number (7-15 digits)",
        verify_email: "Send verification code",
        verification_code: "Verification code",
        code_sent: "Code sent to email",
        code_invalid: "Invalid code",
        code_verified: "Code verified",
        verify_code_btn: "Verify code",
        enter_code: "Enter 6-digit code",
        distance_label: "Distance",
        contact_title: "Contact Us",
        contact_phone: "Phone",
        contact_owner: "Owner",
        contact_address: "Address",
        contact_email: "Email",
        footer_desc: "Services and transport across Slavonia",
        footer_links: "Quick Links",
        footer_follow: "Follow Us",
        footer_rights: "All rights reserved.",
        login_title: "Login",
        login_password: "Password",
        register_title: "Register"
    }
};

let currentLang = 'hr';

function translatePage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang][key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
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
        translatePage(lang);
    });
});

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const targetPosition = target.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 5px 20px rgba(0,0,0,0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    }
});

const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const closeBtns = document.querySelectorAll('.close');

if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'block';
    });
}

if (registerBtn) {
    registerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.style.display = 'block';
    });
}

closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
    });
});

// Modal only closes via X button - not by clicking outside

// Password visibility toggle
document.querySelectorAll('.password-toggle').forEach(toggle => {
    toggle.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        
        if (input.type === 'password') {
            input.type = 'text';
            this.classList.remove('fa-eye');
            this.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye');
        }
    });
});

// Password requirements validation
const regPassword = document.getElementById('regPassword');
if (regPassword) {
    regPassword.addEventListener('input', function() {
        const password = this.value;
        
        // Check length
        const lengthReq = document.getElementById('req-length');
        if (password.length >= 8) {
            lengthReq.classList.add('valid');
        } else {
            lengthReq.classList.remove('valid');
        }
        
        // Check uppercase
        const uppercaseReq = document.getElementById('req-uppercase');
        if (/[A-Z]/.test(password)) {
            uppercaseReq.classList.add('valid');
        } else {
            uppercaseReq.classList.remove('valid');
        }
        
        // Check lowercase
        const lowercaseReq = document.getElementById('req-lowercase');
        if (/[a-z]/.test(password)) {
            lowercaseReq.classList.add('valid');
        } else {
            lowercaseReq.classList.remove('valid');
        }
        
        // Check number
        const numberReq = document.getElementById('req-number');
        if (/[0-9]/.test(password)) {
            numberReq.classList.add('valid');
        } else {
            numberReq.classList.remove('valid');
        }
    });
}

// Password confirmation validation
const regPasswordConfirm = document.getElementById('regPasswordConfirm');
if (regPasswordConfirm) {
    regPasswordConfirm.addEventListener('input', function() {
        const password = document.getElementById('regPassword').value;
        const confirmPassword = this.value;
        const errorMsg = document.getElementById('passwordMatchError');
        
        if (confirmPassword && password !== confirmPassword) {
            errorMsg.style.display = 'block';
        } else {
            errorMsg.style.display = 'none';
        }
    });
}

// Forgot password link
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', () => {
        window.location.href = 'password-reset.html';
    });
}

// Google Sign-In buttons
const googleLoginBtn = document.getElementById('googleLoginBtn');
const googleRegisterBtn = document.getElementById('googleRegisterBtn');

if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
        const result = await loginWithGoogle();
        
        if (result.success) {
            loginModal.style.display = 'none';
            window.location.href = 'dashboard.html';
        } else {
            if (result.message !== 'Prijava otkazana') {
                notify.error(result.message);
            }
        }
    });
}

if (googleRegisterBtn) {
    googleRegisterBtn.addEventListener('click', async () => {
        const result = await loginWithGoogle();
        
        if (result.success) {
            registerModal.style.display = 'none';
            notify.success('Uspješna registracija sa Google!');
            window.location.href = 'dashboard.html';
        } else {
            if (result.message !== 'Prijava otkazana') {
                notify.error(result.message);
            }
        }
    });
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const result = await loginUser(email, password);
    
    if (result.success) {
        // Firebase auth state will persist automatically
        window.location.href = 'dashboard.html';
    } else {
        notify.error(result.message || (currentLang === 'hr' ? 'Greška pri prijavi' : 'Login error'));
    }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regPasswordConfirm').value;
    
    // Validate password requirements
    if (password.length < 8) {
        notify.error('Lozinka mora imati najmanje 8 znakova');
        return;
    }
    
    if (!/[A-Z]/.test(password)) {
        notify.error('Lozinka mora sadržavati najmanje jedno veliko slovo');
        return;
    }
    
    if (!/[a-z]/.test(password)) {
        notify.error('Lozinka mora sadržavati najmanje jedno malo slovo');
        return;
    }
    
    if (!/[0-9]/.test(password)) {
        notify.error('Lozinka mora sadržavati najmanje jedan broj');
        return;
    }
    
    // Check password confirmation
    if (password !== confirmPassword) {
        notify.error('Lozinke se ne podudaraju');
        return;
    }
    
    const result = await registerUser(name, email, phone, password);
    
    if (result.success) {
        notify.success(currentLang === 'hr' ? 'Uspješna registracija! Možete se prijaviti.' : 'Registration successful! You can now login.');
        registerModal.style.display = 'none';
        document.getElementById('registerForm').reset();
        // Reset password requirements
        document.querySelectorAll('.requirement-item').forEach(item => item.classList.remove('valid'));
    } else {
        notify.error(result.message || (currentLang === 'hr' ? 'Greška pri registraciji' : 'Registration error'));
    }
});

// Handle service type change to show/hide location fields
const serviceSelect = document.getElementById('service');
const transportLocationFields = document.getElementById('transportLocationFields');
const fixedLocationField = document.getElementById('fixedLocationField');
const fromInput = document.getElementById('from');
const toInput = document.getElementById('to');
const locationInput = document.getElementById('location');

if (serviceSelect) {
    serviceSelect.addEventListener('change', function() {
        const serviceType = this.value;
        
        if (serviceType === 'transport') {
            // Show from/to fields for transport
            transportLocationFields.style.display = 'grid';
            fixedLocationField.style.display = 'none';
            fromInput.required = true;
            toInput.required = true;
            locationInput.required = false;
        } else if (serviceType && serviceType !== '') {
            // Show single location field for other services
            transportLocationFields.style.display = 'none';
            fixedLocationField.style.display = 'grid';
            fromInput.required = false;
            toInput.required = false;
            locationInput.required = true;
        } else {
            // No service selected - hide both
            transportLocationFields.style.display = 'grid';
            fixedLocationField.style.display = 'none';
            fromInput.required = false;
            toInput.required = false;
            locationInput.required = false;
        }
    });
}

// Phone validation function - accepts international numbers
function validatePhoneNumber(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Accept any phone number with 7-15 digits (international standard)
    if (cleanPhone.length >= 7 && cleanPhone.length <= 15) {
        return { valid: true, message: translations[currentLang].phone_valid };
    }
    
    return { valid: false, message: translations[currentLang].phone_invalid };
}

// Email verification system
let verificationCode = null;
let verificationEmail = null;
let isCodeVerified = false;

function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(email, code) {
    try {
        // Call Firebase Cloud Function to send email
        const sendCode = httpsCallable(functions, 'sendVerificationCode');
        await sendCode({ email, code });
        return { success: true };
    } catch (error) {
        console.error('Error sending verification email:', error);
        return { success: true };
    }
}

// Send verification code button
const sendCodeBtn = document.getElementById('sendCodeBtn');
if (sendCodeBtn) {
    sendCodeBtn.addEventListener('click', async function() {
        const emailInput = document.getElementById('email');
        const email = emailInput.value;
        
        if (!email || !emailInput.checkValidity()) {
            notify.error(currentLang === 'hr' ? 'Unesite valjanu email adresu' : 'Enter a valid email address');
            emailInput.focus();
            return;
        }
        
        // Generate and store verification code
        verificationCode = generateVerificationCode();
        verificationEmail = email;
        
        // Show loading state
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Šaljem...';
        
        // Send email (simulated for now)
        await sendVerificationEmail(email, verificationCode);
        
        // Show verification code field
        document.getElementById('verificationCodeRow').style.display = 'grid';
        document.getElementById('verificationCode').required = true;
        
        // Update button
        this.innerHTML = '<i class="fas fa-check"></i> ' + translations[currentLang].code_sent;
        this.style.background = '#28a745';
        
        notify.success(currentLang === 'hr' ? 
            `Verifikacijski kod poslan na ${email}. Provjerite inbox i spam folder.` : 
            `Verification code sent to ${email}. Check inbox and spam folder.`);
        
        // Re-enable after 30 seconds
        setTimeout(() => {
            this.disabled = false;
            this.innerHTML = '<i class="fas fa-envelope"></i> ' + translations[currentLang].verify_email;
            this.style.background = 'var(--primary-blue)';
        }, 30000);
    });
}

// Verify code button
const verifyCodeBtn = document.getElementById('verifyCodeBtn');
if (verifyCodeBtn) {
    verifyCodeBtn.addEventListener('click', function() {
        const codeInput = document.getElementById('verificationCode');
        const enteredCode = codeInput.value;
        const email = document.getElementById('email').value;
        
        if (!enteredCode || enteredCode.length !== 6) {
            notify.error(currentLang === 'hr' ? 'Unesite 6-znamenkasti kod' : 'Enter 6-digit code');
            codeInput.focus();
            return;
        }
        
        // Validate code
        if (enteredCode === verificationCode && email === verificationEmail) {
            isCodeVerified = true;
            codeInput.disabled = true;
            codeInput.style.borderColor = '#28a745';
            this.innerHTML = '<i class="fas fa-check-circle"></i> ' + translations[currentLang].code_verified;
            this.style.background = '#28a745';
            this.disabled = true;
            notify.success(currentLang === 'hr' ? 'Kod uspješno potvrđen!' : 'Code verified successfully!');
        } else {
            isCodeVerified = false;
            codeInput.style.borderColor = '#dc3545';
            notify.error(currentLang === 'hr' ? 'Neispravan kod. Pokušajte ponovno.' : 'Invalid code. Try again.');
            codeInput.focus();
        }
    });
}

// Google Maps initialization
let fromAutocomplete, toAutocomplete, locationAutocomplete;
let distanceService;

window.initMap = function() {
    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || !google.maps) {
        console.log('Google Maps API not yet loaded');
        return;
    }
    
    try {
        // Initialize Distance Matrix Service
        distanceService = new google.maps.DistanceMatrixService();
        
        // Initialize autocomplete for transport fields
        const fromInput = document.getElementById('from');
        const toInput = document.getElementById('to');
        const locationInput = document.getElementById('location');
        
        if (fromInput) {
            fromAutocomplete = new google.maps.places.Autocomplete(fromInput, {
                types: ['address'],
                componentRestrictions: { country: ['hr', 'rs', 'ba', 'si', 'hu', 'at', 'de', 'it'] }
            });
            
            fromAutocomplete.addListener('place_changed', calculateDistance);
        }
        
        if (toInput) {
            toAutocomplete = new google.maps.places.Autocomplete(toInput, {
                types: ['address'],
                componentRestrictions: { country: ['hr', 'rs', 'ba', 'si', 'hu', 'at', 'de', 'it'] }
            });
            
            toAutocomplete.addListener('place_changed', calculateDistance);
        }
        
        if (locationInput) {
            locationAutocomplete = new google.maps.places.Autocomplete(locationInput, {
                types: ['address'],
                componentRestrictions: { country: ['hr', 'rs', 'ba', 'si', 'hu', 'at', 'de', 'it'] }
            });
        }
    } catch (error) {
        console.error('Error initializing Google Maps:', error);
    }
};

function calculateDistance() {
    if (!distanceService) {
        console.log('Distance service not initialized');
        return;
    }
    
    const fromPlace = fromAutocomplete?.getPlace();
    const toPlace = toAutocomplete?.getPlace();
    
    if (!fromPlace?.geometry || !toPlace?.geometry) {
        return;
    }
    
    const origin = fromPlace.geometry.location;
    const destination = toPlace.geometry.location;
    
    distanceService.getDistanceMatrix({
        origins: [origin],
        destinations: [destination],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC
    }, function(response, status) {
        if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
            const distanceInMeters = response.rows[0].elements[0].distance.value;
            const distanceInKm = (distanceInMeters / 1000).toFixed(1);
            
            document.getElementById('distanceValue').textContent = distanceInKm;
            document.getElementById('distanceDisplay').style.display = 'block';
        }
    });
}

// Add phone validation on input
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    let phoneValidationTimeout;
    
    phoneInput.addEventListener('input', function() {
        clearTimeout(phoneValidationTimeout);
        
        const existingMsg = this.parentElement.querySelector('.phone-validation-msg');
        if (existingMsg) existingMsg.remove();
        
        this.style.borderColor = '#e0e0e0';
        
        if (this.value.length >= 9) {
            phoneValidationTimeout = setTimeout(() => {
                const validation = validatePhoneNumber(this.value);
                
                const msgDiv = document.createElement('div');
                msgDiv.className = 'phone-validation-msg';
                msgDiv.style.cssText = 'margin-top: 5px; font-size: 0.85rem; display: flex; align-items: center; gap: 5px;';
                
                if (validation.valid) {
                    msgDiv.innerHTML = `<i class="fas fa-check-circle" style="color: #28a745;"></i><span style="color: #28a745;">${validation.message}</span>`;
                    this.style.borderColor = '#28a745';
                } else {
                    msgDiv.innerHTML = `<i class="fas fa-exclamation-circle" style="color: #dc3545;"></i><span style="color: #dc3545;">${validation.message}</span>`;
                    this.style.borderColor = '#dc3545';
                }
                
                this.parentElement.appendChild(msgDiv);
            }, 500);
        }
    });
}

document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const serviceType = document.getElementById('service').value;
    const isTransport = serviceType === 'transport';
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;

    // Check if verification code was sent
    if (!verificationCode) {
        notify.error(currentLang === 'hr' ? 
            'Molimo prvo pošaljite verifikacijski kod na email' : 
            'Please send verification code to email first');
        document.getElementById('sendCodeBtn').focus();
        return;
    }

    // Check if code is verified
    if (!isCodeVerified) {
        notify.error(currentLang === 'hr' ? 
            'Molimo prvo potvrdite verifikacijski kod' : 
            'Please verify the code first');
        document.getElementById('verifyCodeBtn').focus();
        return;
    }

    // Validate phone number before submitting
    const phoneValidation = validatePhoneNumber(phone);
    
    if (!phoneValidation.valid) {
        notify.error(phoneValidation.message);
        document.getElementById('phone').focus();
        document.getElementById('phone').style.borderColor = '#dc3545';
        return;
    }
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: phone,
        service: serviceType,
        from: isTransport ? document.getElementById('from').value : document.getElementById('location').value,
        to: isTransport ? document.getElementById('to').value : '',
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        message: document.getElementById('message').value
    };
    
    const result = await createPublicBooking(formData);
    
    if (result.success) {
        notify.success(currentLang === 'hr' ? 'Rezervacija uspješno poslana! Kontaktirat ćemo vas uskoro.' : 'Booking sent successfully! We will contact you soon.');
        document.getElementById('bookingForm').reset();
        transportLocationFields.style.display = 'grid';
        fixedLocationField.style.display = 'none';
        
        // Reset verification
        verificationCode = null;
        verificationEmail = null;
        isCodeVerified = false;
        document.getElementById('verificationCodeRow').style.display = 'none';
        document.getElementById('verificationCode').required = false;
        document.getElementById('verificationCode').disabled = false;
        document.getElementById('verificationCode').style.borderColor = '#e0e0e0';
        document.getElementById('sendCodeBtn').disabled = false;
        document.getElementById('sendCodeBtn').innerHTML = '<i class="fas fa-envelope"></i> ' + translations[currentLang].verify_email;
        document.getElementById('sendCodeBtn').style.background = 'var(--primary-blue)';
        if (document.getElementById('verifyCodeBtn')) {
            document.getElementById('verifyCodeBtn').disabled = false;
            document.getElementById('verifyCodeBtn').innerHTML = '<i class="fas fa-check"></i> ' + translations[currentLang].verify_code_btn;
            document.getElementById('verifyCodeBtn').style.background = 'var(--primary-blue)';
        }
        
        const phoneMsg = phoneInput.parentElement.querySelector('.phone-validation-msg');
        if (phoneMsg) phoneMsg.remove();
        phoneInput.style.borderColor = '#e0e0e0';
    } else {
        notify.error(result.message || (currentLang === 'hr' ? 'Greška pri slanju rezervacije' : 'Booking error'));
    }
});

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.service-card, .contact-card, .stat').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});

const today = new Date().toISOString().split('T')[0];
document.getElementById('date').setAttribute('min', today);
