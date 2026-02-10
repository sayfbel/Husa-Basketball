const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

exports.initTable = async () => {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS contact_messages (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                subject VARCHAR(255),
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await db.query(query);
        console.log('Contact messages table initialized');
    } catch (error) {
        console.error('Error initializing contact table:', error);
    }
};

exports.submitContact = async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email address.' });
    }

    try {
        const id = uuidv4();
        const query = 'INSERT INTO contact_messages (id, name, email, subject, message) VALUES (?, ?, ?, ?, ?)';
        await db.query(query, [id, name, email, subject || 'No Subject', message]);

        res.status(201).json({ message: 'Message sent successfully!', id });
    } catch (error) {
        console.error('Error submitting contact form:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};
