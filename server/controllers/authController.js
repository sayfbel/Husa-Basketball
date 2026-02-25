const db = require('../config/db');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');


exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide username and password' });
    }

    try {
        // Query database for user with their photo_url
        const [rows] = await db.query(`
            SELECT u.*, COALESCE(p.photo_url, s.photo_url) as photo_url
            FROM users u
            LEFT JOIN players p ON u.id = p.id
            LEFT JOIN staff s ON u.id = s.id
            WHERE u.username = ?
        `, [username]);

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
            image: user.photo_url || 'http://localhost:5000/uploads/default.png'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addUser = async (req, res) => {
    const { username, password, role, position } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    let photoUrl = req.body.existingPhotoUrl || 'http://localhost:5000/uploads/default.png';
    const id = `usr_${Date.now()}`;

    try {
        if (req.file) {
            const originalPath = req.file.path;
            const bgRemovedFilename = `${id}_nobg.png`;
            const uploadDir = path.join(__dirname, '../uploads');
            const bgRemovedPath = path.join(uploadDir, bgRemovedFilename);

            // Execute Python script
            const venvPythonPath = path.join(__dirname, '../../.venv/Scripts/python.exe');
            const scriptPath = path.join(__dirname, '../../client/src/context/remove_bg.py');

            await new Promise((resolve, reject) => {
                const command = `"${venvPythonPath}" "${scriptPath}" "${originalPath}" "${bgRemovedPath}"`;
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Python script error: ${error.message}`);
                        return reject(error);
                    }
                    if (stderr) {
                        console.error(`Python script stderr: ${stderr}`);
                    }
                    resolve();
                });
            });

            // If success, use the background removed image and delete original
            photoUrl = 'http://localhost:5000/uploads/' + bgRemovedFilename;
            fs.unlink(originalPath, (err) => {
                if (err) console.error("Error deleting original uploaded file:", err);
            });
        }

        await db.query('INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)', [id, username, password, role]);

        if (role === 'Player') {
            await db.query('INSERT INTO players (id, name, position, photo_url) VALUES (?, ?, ?, ?)', [id, username, position || 'Unknown', photoUrl]);
        } else {
            let department = 'office';
            if (role === 'Coach') department = 'coaching';
            if (role === 'Medical') department = 'medical';

            await db.query('INSERT INTO staff (id, name, role, department, photo_url) VALUES (?, ?, ?, ?, ?)', [id, username, role, department, photoUrl]);
        }

        res.status(201).json({ message: 'User added successfully', id });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Username already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

exports.previewBgRemove = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const id = `preview_${Date.now()}`;
        const originalPath = req.file.path;
        const bgRemovedFilename = `${id}_nobg.png`;
        const uploadDir = path.join(__dirname, '../uploads');
        const bgRemovedPath = path.join(uploadDir, bgRemovedFilename);

        // Execute Python script
        const venvPythonPath = path.join(__dirname, '../../.venv/Scripts/python.exe');
        const scriptPath = path.join(__dirname, '../../client/src/context/remove_bg.py');

        await new Promise((resolve, reject) => {
            const command = `"${venvPythonPath}" "${scriptPath}" "${originalPath}" "${bgRemovedPath}"`;
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Python script error: ${error.message}`);
                    return reject(error);
                }
                resolve();
            });
        });

        // If success, return the new image URL and delete original
        fs.unlink(originalPath, (err) => { });

        res.json({ photoUrl: `http://localhost:5000/uploads/${bgRemovedFilename}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing preview' });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const query = `
            SELECT 
                u.id, 
                u.username, 
                u.role, 
                COALESCE(p.photo_url, s.photo_url) as photo_url,
                COALESCE(p.height, s.height) as height,
                COALESCE(p.weight, s.weight) as weight,
                COALESCE(p.age, s.age) as age,
                COALESCE(p.bio, s.bio) as bio,
                COALESCE(p.email, s.email) as email,
                COALESCE(p.phone, s.phone) as phone,
                p.jersey_number,
                COALESCE(p.position, s.department) as position_or_dept
            FROM users u
            LEFT JOIN players p ON u.id = p.id
            LEFT JOIN staff s ON u.id = s.id
        `;
        const [rows] = await db.query(query); // Gather expanded info
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, password, height, weight, age, email, phone, bio, jersey_number, position_or_dept } = req.body;
    try {
        if (password && password.trim() !== '') {
            await db.query('UPDATE users SET username = ?, password = ? WHERE id = ?', [username, password, id]);
        } else {
            await db.query('UPDATE users SET username = ? WHERE id = ?', [username, id]);
        }

        // Get user role to know if player or staff
        const [users] = await db.query('SELECT role FROM users WHERE id = ?', [id]);
        if (users.length > 0) {
            const role = users[0].role;
            if (role === 'Player') {
                await db.query(`
                    UPDATE players SET 
                        name = ?, height = ?, weight = ?, age = ?, email = ?, phone = ?, bio = ?, jersey_number = ?, position = ? 
                    WHERE id = ?`,
                    [username, height || null, weight || null, age || null, email || null, phone || null, bio || null, jersey_number || null, position_or_dept || 'Unknown', id]);
            } else {
                await db.query(`
                    UPDATE staff SET 
                        name = ?, height = ?, weight = ?, age = ?, email = ?, phone = ?, bio = ?, department = ? 
                    WHERE id = ?`,
                    [username, height || null, weight || null, age || null, email || null, phone || null, bio || null, position_or_dept || 'office', id]);
            }
        }

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Username already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        await db.query('DELETE FROM players WHERE id = ?', [id]);
        await db.query('DELETE FROM staff WHERE id = ?', [id]);
        res.json({ message: 'User deleted successfully' });
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
        { id: 'pl5', name: "Moudden Mohamed", number: 5, pos: "Guard", img: "http://localhost:5000/uploads/MouddenMohamed.jpg", h: "190cm", w: "85kg", age: 24, bio: "Agile playmaker with excellent vision." },
        { id: 'pl6', name: "Echraouqi Khalid", number: 6, pos: "Forward", img: "http://localhost:5000/uploads/EchraouqiKhalid.jpg", h: "198cm", w: "92kg", age: 26, bio: "Strong defensive presence." },
        { id: 'pl7', name: "Ech Charany Mohamed", number: 7, pos: "Guard", img: "http://localhost:5000/uploads/EchCharanyMohamed.jpg", h: "188cm", w: "82kg", age: 23, bio: "Sharp shooter from deep." },
        { id: 'pl8', name: "Laamrani Youness", number: 8, pos: "Center", img: "http://localhost:5000/uploads/LaamraniYouness.jpg", h: "205cm", w: "105kg", age: 28, bio: "Dominant in the paint." },
        { id: 'pl9', name: "Guaouzi Zoubir", number: 9, pos: "Forward", img: "http://localhost:5000/uploads/GuaouziZoubir.jpg", h: "196cm", w: "90kg", age: 25, bio: "Versatile wing player." },
        { id: 'pl10', name: "Choua M'Barek", number: 10, pos: "Center", img: "http://localhost:5000/uploads/ChouaMBarek.jpg", h: "208cm", w: "110kg", age: 29, bio: "Defensive anchor." },
        { id: 'pl11', name: "Choua Ismail", number: 11, pos: "Forward", img: "http://localhost:5000/uploads/ChouaIsmail.jpg", h: "200cm", w: "95kg", age: 27, bio: "Athletic finisher at the rim." },
        { id: 'pl12', name: "Bentabjaoute Youssef", number: 12, pos: "Guard", img: "http://localhost:5000/uploads/BentabjaouteYoussef.jpg", h: "185cm", w: "80kg", age: 22, bio: "Quick and tenacious defender." },
        { id: 'pl13', name: "Soufiane Banyahya", number: 13, pos: "Forward", img: "http://localhost:5000/uploads/default.png", h: "195cm", w: "88kg", age: 24, bio: "Developing talent." },
        { id: 'pl14', name: "Mouad Chanouni", number: 14, pos: "Guard", img: "http://localhost:5000/uploads/default.png", h: "188cm", w: "83kg", age: 23, bio: "Solid backup guard." },
        { id: 'pl15', name: "Elbika Reda", number: 15, pos: "Forward", img: "http://localhost:5000/uploads/default.png", h: "197cm", w: "91kg", age: 25, bio: "Physical forward." },
        { id: 'pl16', name: "Bouchentouf Rabii", number: 16, pos: "Guard", img: "http://localhost:5000/uploads/BouchentoufRabii.jpg", h: "192cm", w: "86kg", age: 26, bio: "Experienced leader." }
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
            img: "http://localhost:5000/uploads/coach.jpg",
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
            img: "http://localhost:5000/uploads/President.jpg",
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
