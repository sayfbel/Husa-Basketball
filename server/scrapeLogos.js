const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const logosDir = path.join(__dirname, 'uploads/logos');
if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
}

// NOTE: This is a starter script. The actual structure of frmbb.ma might vary.
// You may need to inspect the site and update the CSS selectors.
async function scrapeFRMBBLogos() {
    try {
        console.log('Fetching frmbb.ma...');
        const response = await axios.get('https://www.frmbb.ma/');
        const html = response.data;
        const $ = cheerio.load(html);

        // Find all images that might be logos
        const images = $('img');
        console.log(`Found ${images.length} images on the page.`);

        images.each(async (i, el) => {
            const src = $(el).attr('src');
            const alt = $(el).attr('alt') || `logo_${i}`;
            
            if (src && (src.includes('logo') || alt.toLowerCase().includes('logo'))) {
                let fullUrl = src;
                if (!src.startsWith('http')) {
                    fullUrl = `https://www.frmbb.ma${src.startsWith('/') ? '' : '/'}${src}`;
                }

                try {
                    const imgRes = await axios({
                        url: fullUrl,
                        responseType: 'arraybuffer'
                    });
                    
                    // Cleanup alt text to create a filename
                    const safeName = alt.replace(/[^a-z0-9]/gi, '_').toUpperCase();
                    const filePath = path.join(logosDir, `${safeName}.png`);
                    
                    fs.writeFileSync(filePath, imgRes.data);
                    console.log(`Saved: ${safeName}.png`);
                } catch (err) {
                    console.error(`Failed to download ${fullUrl}`);
                }
            }
        });

        console.log('Scraping initiated. Check uploads/logos for results.');
    } catch (error) {
        console.error('Error scraping FRMBB:', error.message);
    }
}

scrapeFRMBBLogos();
