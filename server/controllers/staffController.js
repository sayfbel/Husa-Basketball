const db = require('../config/db');

exports.getAllStaff = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM staff');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching all staff' });
    }
};

exports.getStaffProfile = async (req, res) => {
    const { id } = req.query;
    try {
        const [rows] = await db.query('SELECT * FROM staff WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Staff member not found' });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching staff profile' });
    }
};

exports.updateStaffProfile = async (req, res) => {
    const { id, name, height, weight, bio, role, department, email, phone, age } = req.body;
    try {
        await db.query(`
            UPDATE staff 
            SET name = ?, height = ?, weight = ?, bio = ?, role = ?, department = ?, email = ?, phone = ?, age = ?
            WHERE id = ?
        `, [name, height, weight, bio, role, department, email, phone, age, id]);

        // Also update users table name if it changed
        await db.query('UPDATE users SET username = ? WHERE id = ?', [name, id]);

        res.json({ message: 'Staff profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating staff profile' });
    }
};
