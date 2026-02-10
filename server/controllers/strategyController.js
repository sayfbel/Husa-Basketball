const db = require('../config/db');

// Initialize Table
exports.initTable = async () => {
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS tactics (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                type VARCHAR(50) DEFAULT 'full', -- 'full' or 'half'
                data JSON NOT NULL, -- Store frames array
                user_id VARCHAR(36), -- ID of the user who created it
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await db.query(createTableQuery);

        // Migrating existing tables if 'type' column is missing
        try {
            await db.query('ALTER TABLE tactics ADD COLUMN type VARCHAR(50) DEFAULT "full"');
            console.log('Tactics table migrated with type column');
        } catch (err) {
            // Column likely already exists
        }

        // Migrating existing tables if 'user_id' column is missing
        try {
            await db.query('ALTER TABLE tactics ADD COLUMN user_id VARCHAR(36)');
            console.log('Tactics table migrated with user_id column');
        } catch (err) {
            // Column likely already exists
        }

        console.log('Tactics table initialized');
    } catch (error) {
        console.error('Error initializing tactics table:', error);
    }
};

// Save Strategy
exports.saveStrategy = async (req, res) => {
    const { name, data, type, userId } = req.body;

    if (!name || !data) {
        return res.status(400).json({ message: 'Name and data are required' });
    }

    try {
        const query = 'INSERT INTO tactics (name, data, type, user_id) VALUES (?, ?, ?, ?)';
        const dataString = JSON.stringify(data);
        const courtType = type || 'full';

        const [result] = await db.query(query, [name, dataString, courtType, userId || null]);

        res.status(201).json({
            message: 'Strategy saved successfully',
            id: result.insertId,
            id: result.insertId,
            tactic: { id: result.insertId, name, data, type: courtType, user_id: userId, created_at: new Date() }
        });
    } catch (error) {
        console.error('Error saving strategy:', error);
        res.status(500).json({ message: 'Server error saving strategy' });
    }
};

// Get All Strategies
exports.getStrategies = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM tactics ORDER BY created_at DESC');
        // Parse JSON data back to object
        const strategies = rows.map(row => ({
            ...row,
            data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data
        }));
        res.json(strategies);
    } catch (error) {
        console.error('Error fetching strategies:', error);
        res.status(500).json({ message: 'Server error fetching strategies' });
    }
};

// Delete Strategy
exports.deleteStrategy = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM tactics WHERE id = ?', [id]);
        res.json({ message: 'Strategy deleted successfully' });
    } catch (error) {
        console.error('Error deleting strategy:', error);
        res.status(500).json({ message: 'Server error deleting strategy' });
    }
};
