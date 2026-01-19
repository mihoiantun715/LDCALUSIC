# LD CALUŠIĆ - Prijevoz i Usluge

Modern, bilingual website for LD CALUŠIĆ transport and services company.

## Features

- 🌐 **Bilingual Support**: Croatian (default) and English
- 🎨 **Modern UI/UX**: Clean design with animations using Framer Motion
- 🔐 **Authentication**: Login and registration system
- 📅 **Booking System**: Complete booking form for transport services
- 📱 **Responsive Design**: Works perfectly on all devices
- ⚡ **Fast & Smooth**: Optimized performance with smooth animations

## Color Scheme

Based on the company logo:
- Primary Blue: #1e5ba8
- Secondary Blue: #5ba8e5
- Primary Red: #e31e24
- Accent Yellow: #ffc107
- Dark Blue: #0d2847

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. For development with auto-reload:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
LD CALUSIC PRIJEVOZ I USLUGE/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── script.js           # Frontend JavaScript with animations
├── server.js           # Node.js backend server
├── package.json        # Dependencies
├── logo.png           # Company logo (add your logo here)
├── data/              # Auto-created folder for storing data
│   ├── users.json     # User accounts
│   └── bookings.json  # Booking requests
└── README.md          # This file
```

## Usage

### Language Switcher
Click the HR/EN buttons in the navigation bar to switch between Croatian and English.

### Login/Register
Click the account dropdown in the navigation to access login or registration forms.

### Booking System
Navigate to the booking section and fill out the form to request transport services.

## API Endpoints

- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `POST /api/booking` - Submit booking request
- `GET /api/bookings` - Get all bookings (requires authentication)

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript
- **Animations**: Framer Motion
- **Backend**: Node.js, Express
- **Authentication**: JWT, bcryptjs
- **Storage**: JSON file-based storage

## Notes

- Make sure to add your company logo as `logo.png` in the root directory
- Update contact information in the HTML file
- Change the SECRET_KEY in server.js for production
- For production, consider using a proper database instead of JSON files

## Support

For any issues or questions, contact: info@ldcalusic.hr

---

© 2024 LD CALUŠIĆ. All rights reserved.
