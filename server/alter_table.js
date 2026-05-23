const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'husa_basketball'
    });

    try {
        await db.query("ALTER TABLE match_schedule ADD COLUMN news_title VARCHAR(255);");
        console.log("Added news_title");
    } catch(e) { console.log(e.message); }

    try {
        await db.query("ALTER TABLE match_schedule ADD COLUMN news_content TEXT;");
        console.log("Added news_content");
    } catch(e) { console.log(e.message); }

    try {
        await db.query("ALTER TABLE match_schedule ADD COLUMN news_image_url VARCHAR(255);");
        console.log("Added news_image_url");
    } catch(e) { console.log(e.message); }

    db.end();
}
run();
