const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../config/db');

// Initialize the rankings table
const initTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS rankings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                pos INT,
                club VARCHAR(255),
                logo VARCHAR(512),
                pts INT,
                p INT,
                w INT,
                l INT,
                pf INT,
                pa INT,
                diff INT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
    } catch (err) {
        console.error('Error initializing rankings table:', err);
    }
};

const scrapeAndSave = async () => {
    try {
        const { data } = await axios.get('https://frmbb.ma/1dnh-2025-2026/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);
        let rankings = [];

        $('table').each((i, el) => {
            const $table = $(el);
            const text = $table.text();

            if (text.includes('HUSA')) {
                const rows = [];
                $table.find('tr').each((j, row) => {
                    const $cols = $(row).find('th, td');
                    const cols = $cols.map((k, td) => $(td).text().trim()).get();

                    // The logo is in the second column (index 1) as an img tag
                    const logo = $cols.eq(1).find('img').attr('src');

                    // Index 2 is club name, index 3 is PTS
                    if (cols.length >= 10 && cols[2] !== '' && cols[2] !== 'Clubs' && cols[2] !== 'Club' && !isNaN(parseInt(cols[3]))) {
                        rows.push([
                            parseInt(cols[0]) || 0,
                            cols[2],
                            logo || '',
                            parseInt(cols[3]) || 0,
                            parseInt(cols[4]) || 0,
                            parseInt(cols[5]) || 0,
                            parseInt(cols[6]) || 0,
                            parseInt(cols[9]) || 0,
                            parseInt(cols[10]) || 0,
                            parseInt(cols[11]) || 0
                        ]);
                    }
                });

                if (rows.length > 5) {
                    rankings = rows;
                }
            }
        });

        if (rankings.length > 0) {
            // Sort by points (pts) descending, then by diff
            rankings.sort((a, b) => b[3] - a[3] || b[9] - a[9]);

            // Re-assign positions based on sorted order
            rankings.forEach((r, idx) => {
                r[0] = idx + 1;
            });

            // Clear old data and insert new
            await db.query('DELETE FROM rankings');
            await db.query(
                'INSERT INTO rankings (pos, club, logo, pts, p, w, l, pf, pa, diff) VALUES ?',
                [rankings]
            );
            return true;
        }
    } catch (error) {
        console.error('Scraping error:', error);
        return false;
    }
};

// Update every 24 hours
setInterval(scrapeAndSave, 24 * 60 * 60 * 1000);

const getRankings = async (req, res) => {
    try {
        // Try to get from database first
        let [rows] = await db.query('SELECT * FROM rankings ORDER BY pts DESC, pos ASC');

        // If DB is empty, trigger an immediate scrape
        if (rows.length === 0) {
            await scrapeAndSave();
            [rows] = await db.query('SELECT * FROM rankings ORDER BY pts DESC, pos ASC');
        }

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Rankings not found' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Database/API error:', error);
        res.status(500).json({ message: 'Error retrieving rankings' });
    }
};

module.exports = { getRankings, initTable, scrapeAndSave };
