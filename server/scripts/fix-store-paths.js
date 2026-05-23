const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

async function fixPaths() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'husa_basketball'
    });

    const mapping = {
        '542207433_17887122501357067_4280698276740856535_n..jpg': 'images-1771372767981-193798124.jpg',
        'Gemini_Generated_Image_ceomz6ceomz6ceom.png': 'images-1771372775891-14020844.png',
        '540271147_17886699834357067_1641371197587090454_n..jpg': 'images-1771372748821-139423611.jpg',
        'e37a7414-1b79-4bc6-8769-c7858fbe33b4.png': 'images-1771372757772-435214219.png'
    };

    try {
        const [products] = await connection.query('SELECT id, image_url FROM store_products');
        
        for (const product of products) {
            let images = [];
            try {
                images = JSON.parse(product.image_url);
                if (!Array.isArray(images)) images = [product.image_url];
            } catch (e) {
                images = product.image_url ? [product.image_url] : [];
            }

            let changed = false;
            const newImages = images.map(img => {
                if (img.startsWith('/assets/store/')) {
                    const filename = img.split('/').pop();
                    if (mapping[filename]) {
                        changed = true;
                        return `http://localhost:5000/uploads/${mapping[filename]}`;
                    }
                }
                return img;
            });

            if (changed) {
                await connection.query('UPDATE store_products SET image_url = ? WHERE id = ?', [JSON.stringify(newImages), product.id]);
                console.log(`Updated product ${product.id}`);
            }
        }
        console.log('Finished fixing paths.');
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

fixPaths();
