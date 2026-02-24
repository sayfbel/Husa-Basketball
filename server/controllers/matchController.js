const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../config/db');

// Initialize Tables
exports.initTable = async () => {
    try {
        // 1. Matches Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS matches (
                id VARCHAR(36) PRIMARY KEY,
                opponent VARCHAR(255) NOT NULL,
                date DATETIME NOT NULL,
                status VARCHAR(50) DEFAULT 'scheduled',
                strategy_id JSON,
                starters JSON,
                bench JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Migration: Add strategy_id if missing (for existing tables)
        try {
            await db.query('ALTER TABLE matches ADD COLUMN strategy_id JSON AFTER location');
        } catch (err) { }
        try {
            await db.query('ALTER TABLE matches ADD COLUMN status VARCHAR(50) DEFAULT "scheduled"');
        } catch (err) { }
        try {
            await db.query('ALTER TABLE matches ADD COLUMN starters JSON AFTER strategy_id');
        } catch (err) { }
        try {
            await db.query('ALTER TABLE matches ADD COLUMN bench JSON AFTER starters');
        } catch (err) { }
        console.log('Matches table migrated with new columns');

        // 2. Lineups Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS match_lineups (
                id INT AUTO_INCREMENT PRIMARY KEY,
                match_id VARCHAR(36),
                player_id VARCHAR(36),
                is_starter BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
            )
        `);

        // Migration: Change player_id to VARCHAR if it's currently INT
        try {
            await db.query('ALTER TABLE match_lineups MODIFY COLUMN player_id VARCHAR(36)');
        } catch (err) {
            // Likely already VARCHAR
        }

        // 3. Match Schedule Table (Scraped Data Cache)
        await db.query(`
            CREATE TABLE IF NOT EXISTS match_schedule (
                id INT AUTO_INCREMENT PRIMARY KEY,
                external_id VARCHAR(50),
                date VARCHAR(50),
                time VARCHAR(50),
                venue VARCHAR(255),
                home VARCHAR(255),
                away VARCHAR(255),
                score VARCHAR(50),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_external_id (external_id),
                UNIQUE KEY unique_match (date, home, away)
            )
        `);

        // Migration: Add external_id if missing
        try {
            await db.query('ALTER TABLE match_schedule ADD COLUMN external_id VARCHAR(50) AFTER id');
            await db.query('ALTER TABLE match_schedule ADD UNIQUE KEY unique_external_id (external_id)');
        } catch (err) { }

<<<<<<< HEAD
        // 4. Match Intel Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS match_intel (
                id INT AUTO_INCREMENT PRIMARY KEY,
                match_id VARCHAR(50) UNIQUE,
                report TEXT,
                player_stats JSON,
                images JSON,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
=======
>>>>>>> b0cd6d729bb4fd4f79fcf23481aaf5f0ec81be87

        console.log('Match tables initialized');
    } catch (error) {
        console.error('Error initializing match tables:', error);
    }
};

// Scrape HUSA Matches from FRMBB
exports.scrapeMatches = async (req, res) => {
    try {
        const url = 'https://frmbb.ma/1dnh-2025-2026/';

        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);

        let scrapedMatches = [];

        $('table tr').each((i, row) => {
            const cols = $(row).find('td');
            if (cols.length > 5) { // Minimum cols for a match row
                const rowText = $(row).text().replace(/\s+/g, ' ').toUpperCase();

                if (rowText.includes('HUSA') || rowText.includes('HASSANIA')) {
                    let externalId = $(cols[0]).text().trim();
                    let date = $(cols[1]).text().trim();
                    let time = $(cols[2]).text().trim();
                    let venue = $(cols[3]).text().trim();
                    let home = $(cols[4]).text().trim();
                    let away = $(cols[5]).text().trim();
                    let scoreHome = $(cols[6]).text().trim();
                    let scoreAway = $(cols[7]).text().trim();

                    // Handle shift if ID is missing (Date becomes Col 0)
                    if (externalId.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                        date = externalId;
                        time = $(cols[1]).text().trim();
                        venue = $(cols[2]).text().trim();
                        home = $(cols[3]).text().trim();
                        away = $(cols[4]).text().trim();
                        scoreHome = $(cols[5]).text().trim();
                        scoreAway = $(cols[6]).text().trim();
                        externalId = `SCRAPED_${date}_${home.substring(0, 3)}_${away.substring(0, 3)}`;
                    }

                    // Special case for EXEMPT
                    if (away.includes('EXEMPT') || home.includes('EXEMPT')) {
                        return; // Skip exempt weeks
                    }

                    let finalScore = '-';
                    if (scoreHome && scoreAway && (scoreHome !== '0' || scoreAway !== '0')) {
                        finalScore = `${scoreHome} - ${scoreAway}`;
                    } else if (scoreHome && scoreHome !== '0') {
                        finalScore = scoreHome;
                    }

                    if (date && home && away) {
                        scrapedMatches.push({
                            externalId,
                            date,
                            time,
                            venue,
                            home,
                            away,
                            score: finalScore
                        });
                    }
                }
            }
        });

        if (scrapedMatches.length > 0) {
            for (const match of scrapedMatches) {
                await db.query(`
                    INSERT INTO match_schedule (external_id, date, time, venue, home, away, score)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE 
                    date = VALUES(date),
                    time = VALUES(time),
                    venue = VALUES(venue),
                    score = VALUES(score)
                `, [match.externalId, match.date, match.time, match.venue, match.home, match.away, match.score]);
            }

            // Data Cleanup: Remove old records with '00/00/0000' that now have a real date/ID
            await db.query(`
                DELETE FROM match_schedule 
                WHERE date = '00/00/0000' 
                AND external_id IS NULL
            `);

            // Also deduplicate by teams if one has a date and other doesn't
            await db.query(`
                DELETE t1 FROM match_schedule t1
                INNER JOIN match_schedule t2 ON t1.home = t2.home AND t1.away = t2.away
                WHERE t1.date = '00/00/0000' AND t2.date != '00/00/0000'
            `);
        }

        // Return the updated schedule from DB, ordering by date (00/00/0000 at bottom)
        const [rows] = await db.query(`
            SELECT * FROM match_schedule 
            ORDER BY 
                CASE WHEN date = '00/00/0000' THEN 1 ELSE 0 END,
                STR_TO_DATE(NULLIF(date, '00/00/0000'), '%d/%m/%Y') ASC,
                id ASC
        `);
        res.json(rows);

    } catch (error) {
        console.error('Error scraping/syncing matches:', error.message);
        res.status(500).json({ message: 'Failed to sync match data', error: error.message });
    }
};

// Get Scraped Matches from Database (Fast)
exports.getCachedMatches = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT ms.*, 
                   m.id as saved_match_id,
                   m.starters,
                   m.bench,
                   mi.id as intel_id
            FROM match_schedule ms
            LEFT JOIN matches m ON (
                m.opponent = IF(ms.home LIKE '%HUSA%' OR ms.home LIKE '%Hassania%', ms.away, ms.home)
                AND DATE_FORMAT(m.date, '%d/%m/%Y') = ms.date
            )
            LEFT JOIN match_intel mi ON mi.match_id = ms.external_id
            ORDER BY 
                CASE WHEN ms.date = '00/00/0000' THEN 1 ELSE 0 END,
                STR_TO_DATE(NULLIF(ms.date, '00/00/0000'), '%d/%m/%Y') ASC,
                ms.id ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching cached matches:', error.message);
        res.status(500).json({ message: 'Failed to fetch cached matches', error: error.message });
    }
};

// Get all matches from Database
exports.getMatches = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM matches ORDER BY date ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching matches:', error.message);
        res.status(500).json({ message: 'Failed to fetch matches', error: error.message });
    }
};

// Save Matches and Squads
exports.saveMatchSquad = async (req, res) => {
    // Expected Payload:
    // {
    //   matchId: "uuid" OR null (if new scraped match),
    //   matchData: { ...scrapedData... }, 
    //   squad: [playerIds...],
    //   starters: [playerIds...],
    //   strategyId: "strategy-uuid"
    // }
    const { matchId, matchData, squad, starters, strategyIds } = req.body;
    const db = require('../config/db'); // Assuming db connection is exported here
    const { v4: uuidv4 } = require('uuid');

    try {
        let finalMatchId = matchId;
        const strategiesSerialized = JSON.stringify(strategyIds || []);
        const startersSerialized = JSON.stringify(starters || []);
        const benchSerialized = JSON.stringify(squad ? squad.filter(id => !starters.includes(id)) : []);

        // 1. Create Match if ID not provided (scraped match being saved for first time)
        if (!finalMatchId && matchData) {
            let dbDateTime;
            if (matchData.date && matchData.date !== "N/A" && matchData.date.includes('/')) {
                const [day, month, year] = matchData.date.split('/');
                const formattedDate = `${year}-${month}-${day}`;
                const formattedTime = matchData.time ? `${matchData.time}:00` : '00:00:00';
                dbDateTime = `${formattedDate} ${formattedTime}`;
            } else {
                // Fallback to today if date is invalid
                const d = new Date();
                dbDateTime = d.toISOString().slice(0, 10) + ' 00:00:00';
            }

            const opponent = (matchData.home && (matchData.home.includes('HUSA') || matchData.home.includes('Hassania')))
                ? (matchData.away || 'Unknown Opponent')
                : (matchData.home || 'Unknown Opponent');

            const [existing] = await db.query(
                'SELECT id FROM matches WHERE date = ? AND opponent = ?',
                [dbDateTime, opponent]
            );

            if (existing.length > 0) {
                finalMatchId = existing[0].id;
                await db.query(
                    'UPDATE matches SET strategy_id = ?, starters = ?, bench = ? WHERE id = ?',
                    [strategiesSerialized, startersSerialized, benchSerialized, finalMatchId]
                );
            } else {
                finalMatchId = uuidv4();
                await db.query(
                    'INSERT INTO matches (id, opponent, date, strategy_id, starters, bench) VALUES (?, ?, ?, ?, ?, ?)',
                    [finalMatchId, opponent, dbDateTime, strategiesSerialized, startersSerialized, benchSerialized]
                );
            }
        } else if (finalMatchId) {
            await db.query(
                'UPDATE matches SET strategy_id = ?, starters = ?, bench = ? WHERE id = ?',
                [strategiesSerialized, startersSerialized, benchSerialized, finalMatchId]
            );
        }

        if (!finalMatchId) {
            return res.status(400).json({ message: 'Could not identify or create match.' });
        }

        // 2. Save Squad (Clear existing lineup first for simplicity, or upsert)
        await db.query('DELETE FROM match_lineups WHERE match_id = ?', [finalMatchId]);

        if (squad && squad.length > 0) {
            const values = squad.map(playerId => [
                finalMatchId,
                playerId,
                starters.includes(playerId)
            ]);

            await db.query(
                'INSERT INTO match_lineups (match_id, player_id, is_starter) VALUES ?',
                [values]
            );
        }

        res.json({ message: 'Match squad saved successfully', matchId: finalMatchId });

    } catch (error) {
        console.error('Error saving squad:', error);
        res.status(500).json({ message: 'Failed to save squad', error: error.message });
    }
};

// Get Matches for a specific player
exports.getPlayerMatches = async (req, res) => {
    const { playerName } = req.params;
    try {
        // 1. Find player ID by name
        const [playerRows] = await db.query('SELECT id FROM players WHERE name = ?', [playerName]);
        if (playerRows.length === 0) {
            return res.status(404).json({ message: 'Player not found' });
        }
        const playerId = playerRows[0].id;

        // 2. Get matches where player is in squad
        const [matchRows] = await db.query(`
            SELECT m.*, ml.is_starter 
            FROM matches m
            JOIN match_lineups ml ON m.id = ml.match_id
            WHERE ml.player_id = ?
            ORDER BY m.date DESC
        `, [playerId]);

        // 3. For each match, fetch strategy details and full player details for starters/bench
        const matchesWithDetails = await Promise.all(matchRows.map(async (match) => {
            let strategyIds = [];
            try {
                strategyIds = typeof match.strategy_id === 'string' ? JSON.parse(match.strategy_id) : (match.strategy_id || []);
            } catch (e) { strategyIds = []; }

            // Fetch Strategies
            let strategies = [];
            if (strategyIds.length > 0) {
                const [stratRows] = await db.query('SELECT * FROM tactics WHERE id IN (?)', [strategyIds]);
                strategies = stratRows.map(row => ({
                    ...row,
                    data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data
                }));
            }

            // Fetch Starters Details
            let starterIds = [];
            try {
                starterIds = typeof match.starters === 'string' ? JSON.parse(match.starters) : (match.starters || []);
            } catch (e) { starterIds = []; }

            let starterDetails = [];
            if (starterIds.length > 0) {
                const [starters] = await db.query('SELECT id, name, photo_url, jersey_number, position FROM players WHERE id IN (?)', [starterIds]);
                // Re-order to match starterIds array (1-5 positions)
                starterDetails = starterIds.map(id => starters.find(s => s.id === id)).filter(Boolean);
            }

            // Fetch Bench Details
            let benchIds = [];
            try {
                benchIds = typeof match.bench === 'string' ? JSON.parse(match.bench) : (match.bench || []);
            } catch (e) { benchIds = []; }

            let benchDetails = [];
            if (benchIds.length > 0) {
                const [bench] = await db.query('SELECT id, name, photo_url, jersey_number, position FROM players WHERE id IN (?)', [benchIds]);
                benchDetails = bench;
            }

            return {
                ...match,
                strategies,
                starterDetails,
                benchDetails
            };
        }));

        res.json(matchesWithDetails);
    } catch (error) {
        console.error('Error fetching player matches:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

<<<<<<< HEAD
// Save Match Intel (Report, Stats, Images)
exports.saveIntel = async (req, res) => {
    try {
        const { match_id, report, player_stats } = req.body;
        // Keep existing images or start empty array
        let images = [];
        try {
            if (req.body.existingImages) {
                images = JSON.parse(req.body.existingImages);
            }
        } catch (e) { }

        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                images.push(`/uploads/${file.filename}`);
            });
        }

        const imagesJson = JSON.stringify(images);
        const statsStr = typeof player_stats === 'string' ? player_stats : JSON.stringify(player_stats || {});

        await db.query(`
            INSERT INTO match_intel (match_id, report, player_stats, images)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            report = VALUES(report),
            player_stats = VALUES(player_stats),
            images = VALUES(images)
        `, [match_id, report || '', statsStr, imagesJson]);

        res.json({ message: 'Match Intel Saved successfully' });
    } catch (error) {
        console.error('Error saving match intel:', error);
        res.status(500).json({ message: 'Failed to save intel', error: error.message });
    }
};

// Get Match Intel
exports.getIntel = async (req, res) => {
    try {
        const { match_id } = req.params;
        const [rows] = await db.query('SELECT * FROM match_intel WHERE match_id = ?', [match_id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.json({ report: '', player_stats: "{}", images: "[]" });
        }
    } catch (error) {
        console.error('Error fetching intel:', error);
        res.status(500).json({ message: 'Failed to fetch intel', error: error.message });
    }
};
=======
>>>>>>> b0cd6d729bb4fd4f79fcf23481aaf5f0ec81be87
