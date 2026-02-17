const axios = require('axios');
const cheerio = require('cheerio');

async function testScrape() {
    try {
        const url = 'https://frmbb.ma/1dnh-2025-2026/';
        console.log(`Fetching ${url}...`);
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);

        let found = false;
        $('table tr').each((i, row) => {
            const cols = $(row).find('td');
            if (cols.length > 0) {
                const rowText = $(row).text().toUpperCase();
                if (rowText.includes('HUSA') || rowText.includes('HASSANIA')) {
                    found = true;
                    console.log(`\nRow ${i}: ${$(row).text().replace(/\s+/g, ' ')}`);
                    cols.each((j, col) => {
                        console.log(`  Col ${j}: "${$(col).text().trim()}"`);
                    });
                }
            }
        });

        if (!found) {
            console.log("\nNo HUSA matches found in table rows.");
            // Check if tables exist at all
            console.log(`Total tables found: ${$('table').length}`);
            $('table').each((i, table) => {
                console.log(`Table ${i} has ${$(table).find('tr').length} rows.`);
            });
        }
    } catch (err) {
        console.error("Error:", err.message);
    }
}

testScrape();
