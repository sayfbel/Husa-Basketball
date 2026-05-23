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

exports.getPlayerProfile = async (req, res) => {
    const { id } = req.query;
    try {
        const [rows] = await db.query('SELECT * FROM players WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Player not found' });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching player profile' });
    }
};

exports.updatePlayerProfile = async (req, res) => {
    const { id, name, height, weight, bio, position, jersey_number, email, phone, age } = req.body;
    try {
        if (jersey_number) {
            const [existing] = await db.query(
                'SELECT id, name FROM players WHERE jersey_number = ? AND id != ?',
                [jersey_number, id]
            );
            if (existing.length > 0) {
                return res.status(400).json({ 
                    message: `Jersey number ${jersey_number} is already occupied by ${existing[0].name}` 
                });
            }
        }

        await db.query(`
            UPDATE players 
            SET name = ?, height = ?, weight = ?, bio = ?, position = ?, jersey_number = ?, email = ?, phone = ?, age = ?
            WHERE id = ?
        `, [name, height, weight, bio, position, jersey_number, email, phone, age, id]);

        // Also update users table name if it changed
        await db.query('UPDATE users SET username = ? WHERE id = ?', [name, id]);

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};
