// Firebase Authentication Helper Functions
import { 
    auth, 
    db,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    setDoc,
    getDoc,
    GoogleAuthProvider,
    signInWithPopup
} from './firebase-config.js';

// Google Sign-In
export async function signInWithGoogle() {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Check if user document exists, if not create it
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', user.uid), {
                name: user.displayName || 'Google User',
                email: user.email,
                phone: user.phoneNumber || '',
                createdAt: serverTimestamp(),
                role: 'user',
                provider: 'google'
            });
        }
        
        return {
            success: true,
            user: {
                uid: user.uid,
                name: user.displayName,
                email: user.email
            }
        };
    } catch (error) {
        console.error('Google sign-in error:', error);
        return { 
            success: false, 
            message: error.code === 'auth/popup-closed-by-user' 
                ? 'Prijava otkazana' 
                : 'Greška pri Google prijavi' 
        };
    }
}

// Register new user
export async function registerUser(name, email, phone, password) {
    try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Store additional user data in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            name: name,
            email: email,
            phone: phone,
            createdAt: serverTimestamp(),
            role: 'user'
        });
        
        return {
            success: true,
            user: {
                uid: user.uid,
                name: name,
                email: email,
                phone: phone
            }
        };
    } catch (error) {
        console.error('Registration error:', error);
        let message = 'Greška pri registraciji';
        
        if (error.code === 'auth/email-already-in-use') {
            message = 'Email adresa je već registrirana';
        } else if (error.code === 'auth/weak-password') {
            message = 'Lozinka mora imati najmanje 6 znakova';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Neispravna email adresa';
        }
        
        return { success: false, message: message };
    }
}

// Login user
export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
            return {
                success: true,
                user: {
                    uid: user.uid,
                    ...userDoc.data()
                }
            };
        } else {
            return {
                success: false,
                message: 'Korisnički podaci nisu pronađeni'
            };
        }
    } catch (error) {
        console.error('Login error:', error);
        let message = 'Greška pri prijavi';
        
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            message = 'Neispravna email adresa ili lozinka';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Neispravna email adresa';
        } else if (error.code === 'auth/too-many-requests') {
            message = 'Previše pokušaja prijave. Pokušajte kasnije.';
        } else if (error.code === 'permission-denied') {
            message = 'Greška dozvola - provjerite Firestore pravila';
        }
        
        return { success: false, message: message };
    }
}

// Login with Google
export async function loginWithGoogle() {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Check if user document exists, if not create it
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
            // Create user document for first-time Google sign-in
            await setDoc(doc(db, 'users', user.uid), {
                name: user.displayName || 'Google User',
                email: user.email,
                phone: '',
                createdAt: serverTimestamp(),
                role: 'user',
                provider: 'google'
            });
        }
        
        return {
            success: true,
            user: {
                uid: user.uid,
                name: user.displayName || 'Google User',
                email: user.email,
                phone: userDoc.exists() ? userDoc.data().phone : ''
            }
        };
    } catch (error) {
        console.error('Google sign-in error:', error);
        let message = 'Greška pri Google prijavi';
        
        if (error.code === 'auth/popup-closed-by-user') {
            message = 'Prijava otkazana';
        } else if (error.code === 'auth/popup-blocked') {
            message = 'Popup blokiran - provjerite postavke preglednika';
        } else if (error.code === 'auth/cancelled-popup-request') {
            message = 'Prijava otkazana';
        }
        
        return { success: false, message: message };
    }
}

// Login admin
export async function loginAdmin(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Check if user is admin
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        
        if (adminDoc.exists() && adminDoc.data().role === 'admin') {
            return {
                success: true,
                user: {
                    uid: user.uid,
                    email: user.email,
                    role: 'admin'
                }
            };
        } else {
            // Not an admin, sign out
            await signOut(auth);
            return {
                success: false,
                message: 'Nemate administratorske ovlasti'
            };
        }
    } catch (error) {
        console.error('Admin login error:', error);
        let message = 'Greška pri prijavi';
        
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            message = 'Neispravna email adresa ili lozinka';
        }
        
        return { success: false, message: message };
    }
}

// Logout user
export async function logoutUser() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, message: 'Greška pri odjavi' };
    }
}

// Get current user
export function getCurrentUser() {
    return auth.currentUser;
}

// Check authentication state
export function checkAuthState(callback) {
    return onAuthStateChanged(auth, callback);
}

// Create booking
export async function createBooking(bookingData) {
    try {
        const user = getCurrentUser();
        if (!user) {
            return { success: false, message: 'Morate biti prijavljeni' };
        }
        
        const booking = {
            ...bookingData,
            userId: user.uid,
            email: user.email,
            name: user.displayName || user.email.split('@')[0],
            phone: user.phoneNumber || '',
            status: 'pending',
            createdAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'bookings'), booking);
        
        return {
            success: true,
            bookingId: docRef.id
        };
    } catch (error) {
        console.error('Create booking error:', error);
        return { success: false, message: 'Greška pri kreiranju rezervacije' };
    }
}

// Create public booking (for non-authenticated users)
export async function createPublicBooking(bookingData) {
    try {
        const booking = {
            ...bookingData,
            status: 'pending',
            createdAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'bookings'), booking);
        
        return {
            success: true,
            bookingId: docRef.id
        };
    } catch (error) {
        console.error('Create public booking error:', error);
        return { success: false, message: 'Greška pri slanju rezervacije' };
    }
}

// Get user bookings
export async function getUserBookings() {
    try {
        const user = getCurrentUser();
        if (!user) {
            return { success: false, message: 'Morate biti prijavljeni' };
        }
        
        const q = query(
            collection(db, 'bookings'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const bookings = [];
        
        querySnapshot.forEach((doc) => {
            bookings.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return { success: true, bookings: bookings };
    } catch (error) {
        console.error('Get bookings error:', error);
        return { success: false, message: 'Greška pri učitavanju rezervacija' };
    }
}

// Cancel booking
export async function cancelBooking(bookingId) {
    try {
        const user = getCurrentUser();
        if (!user) {
            return { success: false, message: 'Morate biti prijavljeni' };
        }
        
        await updateDoc(doc(db, 'bookings', bookingId), {
            status: 'cancelled',
            cancelledAt: serverTimestamp()
        });
        
        return { success: true };
    } catch (error) {
        console.error('Cancel booking error:', error);
        return { success: false, message: 'Greška pri otkazivanju rezervacije' };
    }
}

// Admin: Get all bookings
export async function getAllBookings() {
    try {
        const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const bookings = [];
        
        querySnapshot.forEach((doc) => {
            bookings.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return { success: true, bookings: bookings };
    } catch (error) {
        console.error('Get all bookings error:', error);
        return { success: false, message: 'Greška pri učitavanju rezervacija' };
    }
}

// Admin: Get all users
export async function getAllUsers() {
    try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const users = [];
        
        querySnapshot.forEach((doc) => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return { success: true, users: users };
    } catch (error) {
        console.error('Get all users error:', error);
        return { success: false, message: 'Greška pri učitavanju korisnika' };
    }
}

// Admin: Update booking status
export async function updateBookingStatus(bookingId, status) {
    try {
        await updateDoc(doc(db, 'bookings', bookingId), {
            status: status,
            updatedAt: serverTimestamp()
        });
        
        return { success: true };
    } catch (error) {
        console.error('Update booking status error:', error);
        return { success: false, message: 'Greška pri ažuriranju statusa' };
    }
}

// Admin: Delete booking
export async function deleteBooking(bookingId) {
    try {
        await deleteDoc(doc(db, 'bookings', bookingId));
        return { success: true };
    } catch (error) {
        console.error('Delete booking error:', error);
        return { success: false, message: 'Greška pri brisanju rezervacije' };
    }
}

// Check if user is admin
export async function checkIfAdmin() {
    try {
        const user = getCurrentUser();
        if (!user) return false;
        
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        return adminDoc.exists() && adminDoc.data().role === 'admin';
    } catch (error) {
        console.error('Check admin error:', error);
        return false;
    }
}

// Update user email
export async function updateUserEmail(newEmail, password) {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, message: 'Korisnik nije prijavljen' };
        }

        // Re-authenticate user before email change
        const credential = await signInWithEmailAndPassword(auth, user.email, password);
        
        // Update email in Firebase Auth
        const { updateEmail } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        await updateEmail(user, newEmail);
        
        // Update email in Firestore
        await updateDoc(doc(db, 'users', user.uid), {
            email: newEmail
        });
        
        return { success: true, message: 'Email uspješno promijenjen' };
    } catch (error) {
        console.error('Update email error:', error);
        let message = 'Greška pri promjeni emaila';
        
        if (error.code === 'auth/email-already-in-use') {
            message = 'Email adresa je već u upotrebi';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Neispravna email adresa';
        } else if (error.code === 'auth/wrong-password') {
            message = 'Neispravna lozinka';
        } else if (error.code === 'auth/requires-recent-login') {
            message = 'Molimo prijavite se ponovno prije promjene emaila';
        }
        
        return { success: false, message: message };
    }
}

// Send password reset email
export async function sendPasswordReset(email) {
    try {
        const { sendPasswordResetEmail } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        await sendPasswordResetEmail(auth, email);
        
        return { success: true, message: 'Link za resetiranje lozinke poslan na email' };
    } catch (error) {
        console.error('Password reset error:', error);
        let message = 'Greška pri slanju linka';
        
        if (error.code === 'auth/user-not-found') {
            message = 'Korisnik nije pronađen';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Neispravna email adresa';
        }
        
        return { success: false, message: message };
    }
}
