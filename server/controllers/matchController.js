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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Migration: Add strategy_id if missing (for existing tables)
        try {
            await db.query('ALTER TABLE matches ADD COLUMN strategy_id JSON AFTER location');
            console.log('Matches table migrated with strategy_id column');
        } catch (err) {
            // Likely already exists
        }

        // 2. Lineups Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS match_lineups (
                id INT AUTO_INCREMENT PRIMARY KEY,
                match_id VARCHAR(36),
                player_id INT,
                is_starter BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
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

        let matches = [];
        // 2. Scan ALL tables and rows for HUSA matches
        // This bypasses specific header detection ('Groupe -3-') which can be brittle.
        // We look for any row containing "HUSA" or "Hassania".

        $('table tr').each((i, row) => {
            const cols = $(row).find('td');
            if (cols.length > 0) {
                const rowText = $(row).text().replace(/\s+/g, ' ').toUpperCase();

                // Check for HUSA in the row
                if (rowText.includes('HUSA') || rowText.includes('HASSANIA')) {

                    // Column Mapping based on observed FRMBB structure:
                    // Col 0: ID (1DNH...)
                    // Col 1: Date (dd/mm/yyyy)
                    // Col 2: Time (hh:mm)
                    // Col 3: Venue
                    // Col 4: Home Team
                    // Col 5: Away Team
                    // Col 6: Home Score
                    // Col 7: Away Score

                    // Robustness check: Ensure we have enough columns
                    // Sometimes tables might be simpler. Let's try to detect based on content.

                    let date = $(cols[1]).text().trim();
                    let time = $(cols[2]).text().trim();
                    let venue = $(cols[3]).text().trim();
                    let home = $(cols[4]).text().trim();
                    let away = $(cols[5]).text().trim();
                    let scoreHome = $(cols[6]).text().trim();
                    let scoreAway = $(cols[7]).text().trim();

                    // If Col 0 is NOT an ID but the date (shorter tables), shift indices
                    // Check if Col 0 looks like a date (DD/MM/YYYY)
                    const col0Text = $(cols[0]).text().trim();
                    if (col0Text.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                        date = $(cols[0]).text().trim();
                        time = $(cols[1]).text().trim();
                        venue = $(cols[2]).text().trim(); // Or Home
                        // This shift logic depends on the specific variant.
                        // Given the user's screenshot showed ID in Col 0, we stick to the first mapping primarily.
                    }

                    // Format Score
                    let finalScore = '-';
                    if (scoreHome && scoreAway) {
                        finalScore = `${scoreHome} - ${scoreAway}`;
                    } else if (scoreHome) {
                        finalScore = scoreHome;
                    }

                    // Avoid adding duplicate entries if the page lists the same match twice (rare but possible)
                    // Key: Date + Home + Away
                    const duplicateCheck = matches.find(m => m.date === date && m.home === home && m.away === away);

                    if (!duplicateCheck && date && home && away) {
                        matches.push({
                            date,
                            time,
                            home,
                            away,
                            score: finalScore,
                            venue
                        });
                    }
                }
            }
        });

        if (matches.length === 0) {
            // It's possible we didn't find specific headers, or HUSA hasn't played/been scheduled
            return res.json([]);
        }

        res.json(matches);

    } catch (error) {
        console.error('Error scraping matches:', error.message);
        res.status(500).json({ message: 'Failed to scrape data', error: error.message });
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

        // 1. Create Match if ID not provided (scraped match being saved for first time)
        if (!finalMatchId && matchData) {
            // ... (date/time formatting)
            const [day, month, year] = matchData.date.split('/');
            const formattedDate = `${year}-${month}-${day}`;
            const formattedTime = matchData.time ? `${matchData.time}:00` : '00:00:00';
            const dbDateTime = `${formattedDate} ${formattedTime}`;

            const opponent = matchData.home.includes('HUSA') || matchData.home.includes('Hassania')
                ? matchData.away
                : matchData.home;

            const [existing] = await db.query(
                'SELECT id FROM matches WHERE date = ? AND opponent = ?',
                [dbDateTime, opponent]
            );

            if (existing.length > 0) {
                finalMatchId = existing[0].id;
                await db.query(
                    'UPDATE matches SET strategy_id = ? WHERE id = ?',
                    [strategiesSerialized, finalMatchId]
                );
            } else {
                finalMatchId = uuidv4();
                await db.query(
                    'INSERT INTO matches (id, opponent, date, location, strategy_id) VALUES (?, ?, ?, ?, ?)',
                    [finalMatchId, opponent, dbDateTime, matchData.venue, strategiesSerialized]
                );
            }
        } else if (finalMatchId) {
            await db.query(
                'UPDATE matches SET strategy_id = ? WHERE id = ?',
                [strategiesSerialized, finalMatchId]
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
