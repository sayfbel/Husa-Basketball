const db = require('../config/db');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide username and password' });
    }

    try {
        // Query database for user
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length === 0) {
            console.log(`Login failed: User '${username}' not found.`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = rows[0];

        // Debug log (remove in production)
        // console.log(`Checking user: ${username}, stored pass: ${user.password}, provided: ${password}`);

        // Check password (plain text as requested by user "code")
        if (user.password !== password) {
            console.log(`Login failed: Invalid password for '${username}'`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Return user info (excluding password)
        res.json({
            id: user.id,
            name: user.username,
            role: user.role,
            // Add image mapping if we had it in DB, but for now frontend handles it?
            // Actually, if we want to confirm success, we just return basic info.
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const seedLogic = async () => {
    // --- Users Seeding ---
    const users = [
        { id: 'st1', name: "Mohamed Haib", role: "Coach", code: "HCMohamedHaib" },
        { id: 'st2', name: "Youssef Abid", role: "President", code: "PRYoussefAbid" },
        { id: 'pl5', name: "Moudden Mohamed", role: "Player", code: "05MouddenMohamed" },
        { id: 'pl6', name: "Echraouqi Khalid", role: "Player", code: "06EchraouqiKhalid" },
        { id: 'pl7', name: "Ech Charany Mohamed", role: "Player", code: "07EchCharanyMohamed" },
        { id: 'pl8', name: "Laamrani Youness", role: "Player", code: "08LaamraniYouness" },
        { id: 'pl9', name: "Guaouzi Zoubir", role: "Player", code: "09GuaouziZoubir" },
        { id: 'pl10', name: "Choua M'Barek", role: "Player", code: "10ChouaMBarek" },
        { id: 'pl11', name: "Choua Ismail", role: "Player", code: "11ChouaIsmail" },
        { id: 'pl12', name: "Bentabjaoute Youssef", role: "Player", code: "12BentabjaouteYoussef" },
        { id: 'pl13', name: "Soufiane Banyahya", role: "Player", code: "13SoufianeBanyahya" },
        { id: 'pl14', name: "Mouad Chanouni", role: "Player", code: "14MouadChanouni" },
        { id: 'pl15', name: "Elbika Reda", role: "Player", code: "15ElbikaReda" },
        { id: 'pl16', name: "Bouchentouf Rabii", role: "Player", code: "16BouchentoufRabii" }
    ];

    // --- Players Table Seeding ---
    // Note: Assuming 'photo_url' points to static assets served from client/public or server/public
    const players = [
        { id: 'pl5', name: "Moudden Mohamed", number: 5, pos: "Guard", img: "/assets/players/MouddenMohamed.jpg", h: "190cm", w: "85kg", age: 24, bio: "Agile playmaker with excellent vision." },
        { id: 'pl6', name: "Echraouqi Khalid", number: 6, pos: "Forward", img: "/assets/players/EchraouqiKhalid.jpg", h: "198cm", w: "92kg", age: 26, bio: "Strong defensive presence." },
        { id: 'pl7', name: "Ech Charany Mohamed", number: 7, pos: "Guard", img: "/assets/players/EchCharanyMohamed.jpg", h: "188cm", w: "82kg", age: 23, bio: "Sharp shooter from deep." },
        { id: 'pl8', name: "Laamrani Youness", number: 8, pos: "Center", img: "/assets/players/LaamraniYouness.jpg", h: "205cm", w: "105kg", age: 28, bio: "Dominant in the paint." },
        { id: 'pl9', name: "Guaouzi Zoubir", number: 9, pos: "Forward", img: "/assets/players/GuaouziZoubir.jpg", h: "196cm", w: "90kg", age: 25, bio: "Versatile wing player." },
        { id: 'pl10', name: "Choua M'Barek", number: 10, pos: "Center", img: "/assets/players/ChouaMBarek.jpg", h: "208cm", w: "110kg", age: 29, bio: "Defensive anchor." },
        { id: 'pl11', name: "Choua Ismail", number: 11, pos: "Forward", img: "/assets/players/ChouaIsmail.jpg", h: "200cm", w: "95kg", age: 27, bio: "Athletic finisher at the rim." },
        { id: 'pl12', name: "Bentabjaoute Youssef", number: 12, pos: "Guard", img: "/assets/players/BentabjaouteYoussef.jpg", h: "185cm", w: "80kg", age: 22, bio: "Quick and tenacious defender." },
        { id: 'pl13', name: "Soufiane Banyahya", number: 13, pos: "Forward", img: "/assets/players/default.png", h: "195cm", w: "88kg", age: 24, bio: "Developing talent." },
        { id: 'pl14', name: "Mouad Chanouni", number: 14, pos: "Guard", img: "/assets/players/default.png", h: "188cm", w: "83kg", age: 23, bio: "Solid backup guard." },
        { id: 'pl15', name: "Elbika Reda", number: 15, pos: "Forward", img: "/assets/players/default.png", h: "197cm", w: "91kg", age: 25, bio: "Physical forward." },
        { id: 'pl16', name: "Bouchentouf Rabii", number: 16, pos: "Guard", img: "/assets/players/BouchentoufRabii.jpg", h: "192cm", w: "86kg", age: 26, bio: "Experienced leader." }
    ];

    // 1. UPDATE SCHEMA: Check if role column needs altering from ENUM to VARCHAR
    try {
        // This is a rough migration check. It attempts to modify the column.
        // It's safe to run multiple times as long as it's compatible.
        await db.query("ALTER TABLE users MODIFY COLUMN role VARCHAR(50) DEFAULT 'Player'");
    } catch (err) {
        console.log("Schema update note: " + err.message);
    }

    // Seed Users
    for (const user of users) {
        // Since username is UNIQUE, if we find a user with the same name but different ID, 
        // we update their ID to match the new 'plX' or 'stX' format.
        // This ensures they receive reports correctly.
        const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [user.name]);

        if (existing.length > 0) {
            const oldId = existing[0].id;
            if (oldId !== user.id) {
                console.log(`Syncing ID for ${user.name}: ${oldId} -> ${user.id}`);
                await db.query('UPDATE users SET id = ?, role = ?, password = ? WHERE username = ?', [user.id, user.role, user.code, user.name]);
                // Also update any existing reports that used the old ID
                await db.query('UPDATE reports SET player_id = ? WHERE player_id = ?', [user.id, oldId]);
                await db.query('UPDATE reports SET sender_id = ? WHERE sender_id = ?', [user.id, oldId]);
            } else {
                await db.query('UPDATE users SET role = ?, password = ? WHERE id = ?', [user.role, user.code, user.id]);
            }
        } else {
            await db.query('INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)', [user.id, user.name, user.code, user.role]);
        }
    }

    // Migration for old IDs in reports (e.g. c1 -> st1, p1 -> st2)
    const idMap = { 'c1': 'st1', 'p1': 'st2' };
    for (const [oldId, newId] of Object.entries(idMap)) {
        await db.query('UPDATE reports SET sender_id = ? WHERE sender_id = ?', [newId, oldId]);
        await db.query('UPDATE reports SET player_id = ? WHERE player_id = ?', [newId, oldId]);
    }

    // Seed Players Table
    for (const player of players) {
        const sql = `
           INSERT INTO players (id, name, jersey_number, position, photo_url, height, weight, age, bio) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
           name = VALUES(name),
           jersey_number = VALUES(jersey_number),
           position = VALUES(position),
           photo_url = VALUES(photo_url),
           height = VALUES(height),
           weight = VALUES(weight),
           age = VALUES(age),
           bio = VALUES(bio)
        `;
        await db.query(sql, [player.id, player.name, player.number, player.pos, player.img, player.h, player.w, player.age, player.bio]);
    }

    // Ensure Contact Columns exist in players table
    try {
        await db.query("ALTER TABLE players ADD COLUMN IF NOT EXISTS email VARCHAR(255)");
        await db.query("ALTER TABLE players ADD COLUMN IF NOT EXISTS phone VARCHAR(50)");
    } catch (err) {
        console.log("Players contact update note: " + err.message);
    }

    // --- Staff Table Seeding & Migration ---
    try {
        await db.query("ALTER TABLE staff ADD COLUMN IF NOT EXISTS height VARCHAR(50)");
        await db.query("ALTER TABLE staff ADD COLUMN IF NOT EXISTS weight VARCHAR(50)");
        await db.query("ALTER TABLE staff ADD COLUMN IF NOT EXISTS age INT");
        await db.query("ALTER TABLE staff ADD COLUMN IF NOT EXISTS email VARCHAR(255)");
        await db.query("ALTER TABLE staff ADD COLUMN IF NOT EXISTS phone VARCHAR(50)");
        await db.query("ALTER TABLE staff ADD COLUMN IF NOT EXISTS bio TEXT");
    } catch (err) {
        console.log("Staff table migration note: " + err.message);
    }

    const staffMembers = [
        {
            id: 'st1',
            name: "Mohamed Haib",
            role: "Head Coach",
            department: "coaching",
            img: "/assets/players/coach.jpg",
            height: "182cm",
            weight: "78kg",
            age: 45,
            bio: "Elite tactical mind with 15+ years of experience in regional basketball championships. Specialized in high-pressure defensive systems."
        },
        {
            id: 'st2',
            name: "Youssef Abid",
            role: "President",
            department: "office",
            img: "/assets/players/President.jpg",
            height: "178cm",
            weight: "80kg",
            age: 52,
            bio: "Strategic leadership and organizational management. Dedicated to elevating HUSA Basketball to the national elite."
        }
    ];

    for (const member of staffMembers) {
        const sql = `
            INSERT INTO staff (id, name, role, department, photo_url, height, weight, age, bio)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            role = VALUES(role),
            department = VALUES(department),
            photo_url = VALUES(photo_url),
            height = VALUES(height),
            weight = VALUES(weight),
            age = VALUES(age),
            bio = VALUES(bio)
        `;
        await db.query(sql, [
            member.id, member.name, member.role, member.department, member.img,
            member.height, member.weight, member.age, member.bio
        ]);
    }
};

exports.seedUsers = async (req, res) => {
    try {
        await seedLogic();
        if (res) res.json({ message: 'Users seeded successfully' });
    } catch (error) {
        console.error(error);
        if (res) res.status(500).json({ message: 'Seeding failed' });
    }
};

// Export the logic for server start script
exports.seedLogic = seedLogic;
