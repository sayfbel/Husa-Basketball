const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Global crash prevention handlers
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/uploads', express.static('uploads')); // Serve uploaded images

// Placeholder routes
app.get('/', (req, res) => {
    res.send('HUSA Basketball API is running');
});

// Import route files
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/players', require('./routes/playerRoutes'));
app.use('/api/tryouts', require('./routes/tryoutRoutes'));
app.use('/api/tryouts', require('./routes/tryoutRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/store-reservations', require('./routes/storeReservationRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/rankings', require('./routes/rankingRoutes'));
app.use('/api/ocr', require('./routes/ocrRoutes'));

app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/tshirts', require('./routes/tshirtRoutes'));

// Auto-seed users on startup
const authController = require('./controllers/authController');
const strategyController = require('./controllers/strategyController');
const tryoutController = require('./controllers/tryoutController');
const contactController = require('./controllers/contactController');
const matchController = require('./controllers/matchController');
const reservationController = require('./controllers/reservationController');
const storeReservationController = require('./controllers/storeReservationController');
const reportController = require('./controllers/reportController');
const rankingController = require('./controllers/rankingController');
const newsController = require('./controllers/newsController');
const storeController = require('./controllers/storeController');
const tshirtController = require('./controllers/tshirtController');

app.use('/api/strategies', require('./routes/strategyRoutes'));
app.use('/api/store', require('./routes/storeRoutes'));

app.listen(PORT, async () => {
    // console.log(`Server running on port ${PORT}`);
    try {
        await authController.initTable();
        await authController.seedUsers();
        await strategyController.initTable();
        await tryoutController.initTable();
        await contactController.initTable();
        await matchController.initTable();
        await reservationController.initTable();
        await storeReservationController.initTable();
        await storeController.initTable(); // Initialize Products Table
        await reportController.initTable();
        await rankingController.initTable();
        await rankingController.scrapeAndSave(); // Initial scrape if empty
        await newsController.initTable(); // Initialize News Table
        await tshirtController.initTable(); // Initialize Tshirts Table

    } catch (err) {

    }
});
