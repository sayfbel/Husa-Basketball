const db = require('../config/db');

// Initialize Table and Seed Initial Shirt Numbers
exports.initTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS tshirts (
                number INT PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Check if we have any tshirts in the table
        const [rows] = await db.query('SELECT COUNT(*) as count FROM tshirts');
        if (rows[0].count === 0) {
            console.log('Seeding default tshirt numbers...');
            // Seed with numbers 1 to 30, plus 32, 33, 45, 99
            const defaultNumbers = [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 
                11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 
                21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 
                32, 33, 45, 99
            ];
            
            for (const num of defaultNumbers) {
                await db.query('INSERT IGNORE INTO tshirts (number) VALUES (?)', [num]);
            }
            console.log('Default tshirt numbers seeded successfully.');
        }
    } catch (error) {
        console.error('Error initializing tshirts table:', error);
    }
};

// Get all t-shirt numbers
exports.getAllTshirts = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM tshirts ORDER BY number ASC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching tshirts' });
    }
};

// Get available t-shirt numbers (not assigned to any player)
exports.getAvailableTshirts = async (req, res) => {
    try {
        // Find numbers in tshirts that are not currently occupied in the players table
        const query = `
            SELECT t.number 
            FROM tshirts t
            WHERE t.number NOT IN (
                SELECT DISTINCT jersey_number 
                FROM players 
                WHERE jersey_number IS NOT NULL
            )
            ORDER BY t.number ASC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching available tshirts' });
    }
};

// Add a new t-shirt number
exports.addTshirt = async (req, res) => {
    const { number } = req.body;
    
    if (number === undefined || number === null || isNaN(parseInt(number))) {
        return res.status(400).json({ message: 'Please provide a valid number' });
    }

    const shirtNum = parseInt(number);
    if (shirtNum < 0 || shirtNum > 99) {
        return res.status(400).json({ message: 'Jersey number must be between 0 and 99' });
    }

    try {
        // Check if number already exists
        const [existing] = await db.query('SELECT * FROM tshirts WHERE number = ?', [shirtNum]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'This tshirt number already exists' });
        }

        await db.query('INSERT INTO tshirts (number) VALUES (?)', [shirtNum]);
        res.status(201).json({ message: 'Tshirt number added successfully', number: shirtNum });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error adding tshirt number' });
    }
};

// Delete a t-shirt number
exports.deleteTshirt = async (req, res) => {
    const { number } = req.params;

    if (!number || isNaN(parseInt(number))) {
        return res.status(400).json({ message: 'Invalid tshirt number' });
    }

    const shirtNum = parseInt(number);

    try {
        // Check if number is currently used by any player
        const [occupied] = await db.query('SELECT name FROM players WHERE jersey_number = ?', [shirtNum]);
        if (occupied.length > 0) {
            return res.status(400).json({ 
                message: `Cannot delete number ${shirtNum} as it is currently assigned to player ${occupied[0].name}` 
            });
        }

        const [result] = await db.query('DELETE FROM tshirts WHERE number = ?', [shirtNum]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Tshirt number not found' });
        }

        res.json({ message: 'Tshirt number deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting tshirt number' });
    }
};
