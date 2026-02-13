const db = require('../config/db');

exports.initTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_id VARCHAR(36) NOT NULL,
                sender_name VARCHAR(255) NOT NULL,
                recipient_role VARCHAR(50) NOT NULL,
                recipient_id VARCHAR(36),
                player_id VARCHAR(36),
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'technical',
                priority VARCHAR(20) DEFAULT 'normal',
                status VARCHAR(20) DEFAULT 'unseen',
                response TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Reports table initialized');
    } catch (error) {
        console.error('Error initializing reports table:', error);
    }
};

exports.getReportsByPlayer = async (req, res) => {
    const { playerId } = req.query;

    try {
        let query = 'SELECT * FROM reports ORDER BY created_at DESC';
        let params = [];

        if (playerId) {
            query = 'SELECT * FROM reports WHERE player_id = ? OR sender_id = ? ORDER BY created_at DESC';
            params = [playerId, playerId];
        }

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Server error fetching reports', error: error.message });
    }
};

exports.sendReport = async (req, res) => {
    const { sender_id, sender_name, recipient_role, recipient_id, player_id, title, content, type, priority } = req.body;

    if (!sender_id || !title || !content) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        await db.query(
            'INSERT INTO reports (sender_id, sender_name, recipient_role, recipient_id, player_id, title, content, type, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [sender_id, sender_name, recipient_role, recipient_id || null, player_id || sender_id, title, content, type || 'technical', priority || 'normal']
        );
        res.status(201).json({ success: true, message: 'Report sent successfully' });
    } catch (error) {
        console.error('Error sending report:', error);
        res.status(500).json({ message: 'Server error sending report' });
    }
};
exports.respondToReport = async (req, res) => {
    const { reportId, response } = req.body;

    if (!reportId || !response) {
        return res.status(400).json({ message: 'Report ID and response content are required' });
    }

    try {
        await db.query(
            'UPDATE reports SET response = ?, status = "seen" WHERE id = ?',
            [response, reportId]
        );
        res.json({ success: true, message: 'Response recorded successfully' });
    } catch (error) {
        console.error('Error responding to report:', error);
        res.status(500).json({ message: 'Server error responding to report', error: error.message });
    }
};
