const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

exports.initTable = async () => {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS kids_reservations (
                id VARCHAR(36) PRIMARY KEY,
                parent_full_name VARCHAR(255) NOT NULL,
                kid_name VARCHAR(255) NOT NULL,
                kid_age INT NOT NULL,
                kid_sex VARCHAR(50) NOT NULL,
                parent_phone VARCHAR(50) NOT NULL,
                preferred_day VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await db.query(query);
        console.log('Kids reservations table initialized');
    } catch (error) {
        console.error('Error initializing reservations table:', error);
    }
};

exports.submitReservation = async (req, res) => {
    const { parentFullName, kidName, kidAge, kidSex, parentPhone, preferredDay } = req.body;

    // Validation
    if (!parentFullName || !kidName || !kidAge || !kidSex || !parentPhone || !preferredDay) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const id = uuidv4();
        const query = `
            INSERT INTO kids_reservations 
            (id, parent_full_name, kid_name, kid_age, kid_sex, parent_phone, preferred_day) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(query, [id, parentFullName, kidName, kidAge, kidSex, parentPhone, preferredDay]);

        res.status(201).json({ message: 'Reservation request sent successfully!', id });
    } catch (error) {
        console.error('Error submitting reservation:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};
