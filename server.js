const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your-secret-key-change-this-in-production';
const ADMIN_EMAIL = 'admin@ldcalusic.hr';
const ADMIN_PASSWORD = 'admin123';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

function readJSON(file) {
    try {
        if (fs.existsSync(file)) {
            return JSON.parse(fs.readFileSync(file, 'utf8'));
        }
        return [];
    } catch (error) {
        console.error('Error reading file:', error);
        return [];
    }
}

function writeJSON(file, data) {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing file:', error);
        return false;
    }
}

app.post('/api/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: 'Sva polja su obavezna / All fields are required' });
        }

        const users = readJSON(USERS_FILE);

        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ message: 'Korisnik već postoji / User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            phone,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        writeJSON(USERS_FILE, users);

        res.status(201).json({ 
            message: 'Registracija uspješna / Registration successful',
            user: { id: newUser.id, name: newUser.name, email: newUser.email }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Greška servera / Server error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email i lozinka su obavezni / Email and password are required' });
        }

        const users = readJSON(USERS_FILE);
        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(401).json({ message: 'Neispravni podaci / Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Neispravni podaci / Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            SECRET_KEY,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Prijava uspješna / Login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Greška servera / Server error' });
    }
});

app.post('/api/booking-detailed', verifyToken, (req, res) => {
    try {
        const { serviceCategory, service, date, time, from, to, serviceDescription, approxWeight, notes } = req.body;

        if (!serviceCategory || !service || !date || !time || !from || !serviceDescription) {
            return res.status(400).json({ message: 'Sva obavezna polja moraju biti popunjena / All required fields must be filled' });
        }

        const bookings = readJSON(BOOKINGS_FILE);

        const newBooking = {
            id: Date.now().toString(),
            userId: req.user.id,
            serviceCategory,
            service,
            date,
            time,
            from,
            to: to || '',
            serviceDescription,
            approxWeight: approxWeight || '',
            notes: notes || '',
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        bookings.push(newBooking);
        writeJSON(BOOKINGS_FILE, bookings);

        res.status(201).json({
            message: 'Rezervacija uspješno primljena / Booking received successfully',
            booking: newBooking
        });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ message: 'Greška servera / Server error' });
    }
});

app.post('/api/booking', (req, res) => {
    try {
        const { name, email, phone, service, from, to, date, time, message } = req.body;

        if (!name || !email || !phone || !service || !from || !to || !date || !time) {
            return res.status(400).json({ message: 'Sva obavezna polja moraju biti popunjena / All required fields must be filled' });
        }

        const bookings = readJSON(BOOKINGS_FILE);

        const newBooking = {
            id: Date.now().toString(),
            name,
            email,
            phone,
            service,
            from,
            to,
            date,
            time,
            message: message || '',
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        bookings.push(newBooking);
        writeJSON(BOOKINGS_FILE, bookings);

        res.status(201).json({
            message: 'Rezervacija uspješno primljena / Booking received successfully',
            booking: newBooking
        });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ message: 'Greška servera / Server error' });
    }
});

app.get('/api/bookings', verifyToken, (req, res) => {
    try {
        const bookings = readJSON(BOOKINGS_FILE);
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Greška servera / Server error' });
    }
});

app.get('/api/my-bookings', verifyToken, (req, res) => {
    try {
        const bookings = readJSON(BOOKINGS_FILE);
        const userBookings = bookings.filter(b => b.userId === req.user.id);
        res.json(userBookings);
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ message: 'Greška servera / Server error' });
    }
});

function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Token nije pronađen / Token not found' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Nevažeći token / Invalid token' });
    }
}

app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            const token = jwt.sign(
                { role: 'admin', email: email },
                SECRET_KEY,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Admin prijava uspješna / Admin login successful',
                token
            });
        } else {
            res.status(401).json({ message: 'Neispravni podaci / Invalid credentials' });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Greška servera / Server error' });
    }
});

app.get('/api/admin/bookings', verifyAdmin, (req, res) => {
    try {
        const bookings = readJSON(BOOKINGS_FILE);
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Greška servera / Server error' });
    }
});

app.get('/api/admin/users', verifyAdmin, (req, res) => {
    try {
        const users = readJSON(USERS_FILE);
        const usersWithoutPasswords = users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            createdAt: u.createdAt
        }));
        res.json(usersWithoutPasswords);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Greška servera / Server error' });
    }
});

app.put('/api/admin/bookings/:id/status', verifyAdmin, (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const bookings = readJSON(BOOKINGS_FILE);
        const bookingIndex = bookings.findIndex(b => b.id === id);

        if (bookingIndex === -1) {
            return res.status(404).json({ message: 'Rezervacija nije pronađena / Booking not found' });
        }

        bookings[bookingIndex].status = status;
        writeJSON(BOOKINGS_FILE, bookings);

        res.json({
            message: 'Status ažuriran / Status updated',
            booking: bookings[bookingIndex]
        });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ message: 'Greška servera / Server error' });
    }
});

app.delete('/api/admin/bookings/:id', verifyAdmin, (req, res) => {
    try {
        const { id } = req.params;

        let bookings = readJSON(BOOKINGS_FILE);
        const initialLength = bookings.length;
        bookings = bookings.filter(b => b.id !== id);

        if (bookings.length === initialLength) {
            return res.status(404).json({ message: 'Rezervacija nije pronađena / Booking not found' });
        }

        writeJSON(BOOKINGS_FILE, bookings);

        res.json({ message: 'Rezervacija obrisana / Booking deleted' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ message: 'Greška servera / Server error' });
    }
});

function verifyAdmin(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Token nije pronađen / Token not found' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Pristup odbijen / Access denied' });
        }
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Nevažeći token / Invalid token' });
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`LD CALUŠIĆ website is ready!`);
});
