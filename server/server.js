const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// app.use('/api/news', require('./routes/news'));

// Auto-seed users on startup
const authController = require('./controllers/authController');
const strategyController = require('./controllers/strategyController');
const tryoutController = require('./controllers/tryoutController');
const contactController = require('./controllers/contactController');

app.use('/api/strategies', require('./routes/strategyRoutes'));

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        await authController.seedUsers();
        await strategyController.initTable();
        await tryoutController.initTable();
        await contactController.initTable();
        console.log('Database seeded & tables initialized');
    } catch (err) {
        console.error('Seeding error:', err);
    }
});
