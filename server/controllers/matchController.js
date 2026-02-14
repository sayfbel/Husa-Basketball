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
                location VARCHAR(255),
                score VARCHAR(50) DEFAULT '-',
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
        // Migration: Add score and status if missing
        try {
            await db.query('ALTER TABLE matches ADD COLUMN score VARCHAR(50) DEFAULT "-" AFTER location');
        } catch (err) { }
        try {
            await db.query('ALTER TABLE matches ADD COLUMN status VARCHAR(50) DEFAULT "scheduled" AFTER score');
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
                date VARCHAR(50),
                time VARCHAR(50),
                venue VARCHAR(255),
                home VARCHAR(255),
                away VARCHAR(255),
                score VARCHAR(50),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_match (date, home, away)
            )
        `);

        console.log('Match tables initialized');
    } catch (error) {
        console.error('Error initializing match tables:', error);
    }
};

// Scrape HUSA Matches from FRMBB
// Scrape HUSA Matches from FRMBB
exports.scrapeMatches = async (req, res) => {
    try {
        const url = 'https://frmbb.ma/1dnh-2025-2026/';

        // 1. Fetch HTML
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        let scrapedMatches = [];

        $('table tr').each((i, row) => {
            const cols = $(row).find('td');
            if (cols.length > 0) {
                const rowText = $(row).text().replace(/\s+/g, ' ').toUpperCase();

                if (rowText.includes('HUSA') || rowText.includes('HASSANIA')) {
                    let date = $(cols[1]).text().trim();
                    let time = $(cols[2]).text().trim();
                    let venue = $(cols[3]).text().trim();
                    let home = $(cols[4]).text().trim();
                    let away = $(cols[5]).text().trim();
                    let scoreHome = $(cols[6]).text().trim();
                    let scoreAway = $(cols[7]).text().trim();

                    const col0Text = $(cols[0]).text().trim();
                    if (col0Text.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                        date = $(cols[0]).text().trim();
                        time = $(cols[1]).text().trim();
                        venue = $(cols[2]).text().trim();
                    }

                    let finalScore = '-';
                    if (scoreHome && scoreAway) {
                        finalScore = `${scoreHome} - ${scoreAway}`;
                    } else if (scoreHome) {
                        finalScore = scoreHome;
                    }

                    if (date && home && away) {
                        scrapedMatches.push([date, time, venue, home, away, finalScore]);
                    }
                }
            }
        });

        if (scrapedMatches.length > 0) {
            // UPSERT into database
            // We use INSERT ... ON DUPLICATE KEY UPDATE
            for (const match of scrapedMatches) {
                await db.query(`
                    INSERT INTO match_schedule (date, time, venue, home, away, score)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE 
                    time = VALUES(time),
                    venue = VALUES(venue),
                    score = VALUES(score)
                `, match);
            }
        }

        // Return the updated schedule from DB
        const [rows] = await db.query('SELECT * FROM match_schedule ORDER BY id ASC');
        res.json(rows);

    } catch (error) {
        console.error('Error scraping/syncing matches:', error.message);
        res.status(500).json({ message: 'Failed to sync match data', error: error.message });
    }
};

// Get Scraped Matches from Database (Fast)
exports.getCachedMatches = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM match_schedule ORDER BY id ASC');
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
            const [day, month, year] = matchData.date.split('/');
            const formattedDate = `${year}-${month}-${day}`;
            const formattedTime = matchData.time ? `${matchData.time}:00` : '00:00:00';
            const dbDateTime = `${formattedDate} ${formattedTime}`;

            const opponent = (matchData.home.includes('HUSA') || matchData.home.includes('Hassania'))
                ? matchData.away
                : matchData.home;

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
                    'INSERT INTO matches (id, opponent, date, location, strategy_id, starters, bench) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [finalMatchId, opponent, dbDateTime, matchData.venue, strategiesSerialized, startersSerialized, benchSerialized]
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
