const db = require('../config/db');

exports.getAllPlayers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM players ORDER BY jersey_number ASC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching players' });
    }
};
