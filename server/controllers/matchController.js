const axios = require('axios');
const cheerio = require('cheerio');

// Scrape HUSA Matches from FRMBB
exports.scrapeMatches = async (req, res) => {
    try {
        const url = 'https://frmbb.ma/1dnh-2025-2026/';

        // 1. Fetch HTML
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        let matches = [];
        let targetTable = null;

        // 2. Find the heading "Groupe -3-"
        // We'll search all headings (h1-h6, strong, b) to cover potential variations
        $('*').each((i, el) => {
            const text = $(el).text().trim();
            if (text.includes('Groupe -3-')) {
                // Found the heading. The next table should be our target.
                // We'll look at the next siblings until we find a table.
                let next = $(el).next();
                while (next.length > 0) {
                    if (next.is('table')) {
                        targetTable = next;
                        return false; // Break the each loop
                    }
                    next = next.next();
                }
            }
        });

        if (!targetTable) {
            return res.status(404).json({ message: 'Table for Groupe -3- not found' });
        }

        // 3. Parse the table
        // Assumption: Table rows contain match data
        // We'll inspect extracted text to identify columns, but for now we'll assume a standard layout:
        // Date | Time | Home | Score | Away | Venue (or similar)
        // Let's iterate rows and extract text
        targetTable.find('tr').each((i, row) => {
            const cols = $(row).find('td');
            if (cols.length > 0) {
                // Robust extraction: Get all text content
                const rowText = $(row).text().trim();

                // 4. Filter for HUSA
                if (rowText.includes('HUSA') || rowText.includes('Hassania Union Sport Agadir')) {
                    // Extract data from columns
                    // Note: Column interaction depends heavily on the specific table structure of the site.
                    // Based on typical sports tables:
                    // Col 0: Date
                    // Col 1: Time
                    // Col 2: Home Team
                    // Col 3: Score (often in middle) or separate cols
                    // Col 4: Away Team
                    // Col 5: Venue

                    // Let's try to map dynamically or use fixed indices based on observation
                    // For now, we'll try fixed indices and refine if needed.
                    // IMPORTANT: The prompt asks to handle changes, but without seeing the HTML, 
                    // we assume a standard structure. If indices shift, we might need a smarter parser.

                    const date = $(cols[0]).text().trim();
                    const time = $(cols[1]).text().trim();
                    const home = $(cols[2]).text().trim();
                    const score = $(cols[3]).text().trim(); // Or sometimes Home Score / Away Score split
                    const away = $(cols[4]).text().trim();
                    const venue = $(cols[5]).text().trim();

                    // Basic check to ensure it's a match row and not a header repeated
                    if (date && (home || away)) {
                        matches.push({
                            date,
                            time,
                            home,
                            away,
                            score,
                            venue
                        });
                    }
                }
            }
        });

        res.json(matches);

    } catch (error) {
        console.error('Error scraping matches:', error.message);
        res.status(500).json({ message: 'Failed to scrape data', error: error.message });
    }
};
