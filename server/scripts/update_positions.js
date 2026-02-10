const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'husa_basketball'
});

async function run() {
    // Map names to their new positions
    // Note: Double check names against exact database entries if updates fail (e.g. "Choua M'Barek" is tricky with quotes)
    const updates = [
        ["Power Forward (4)", "Choua M'Barek"],
        ["Shooting Guard (2)", "Choua Ismail"],
        ["Center (5)", "Bentabjaoute Youssef"],
        ["Power Forward (4)", "Bouchentouf Rabii"],
        ["Power Forward (4)", "Moudden Mohamed"],
        ["Small Forward (3)", "Echraouqi Khalid"],
        ["Point Guard (1)", "Ech Charany Mohamed"],
        ["Shooting Guard (2)", "Laamrani Youness"],
        ["Center (5)", "Guaouzi Zoubir"]
    ];

    try {
        console.log("Starting updates...");
        for (const [pos, name] of updates) {
            // Using prepared statements handles the quotes in "M'Barek" safely
            const [result] = await pool.query('UPDATE players SET position = ? WHERE name LIKE ?', [pos, `%${name}%`]);
            console.log(`Updated ${name}: ${result.affectedRows} rows affected`);
        }
        console.log('Done');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
