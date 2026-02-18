const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const storeController = {
    initTable: async () => {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS store_products (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                description TEXT,
                category VARCHAR(50),
                image_url TEXT,
                in_stock BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        try {
            // Check if column is text, if not, alter it? No, assume user runs clear-store.js or similar if needed.
            // Actually, I should probably alter it just in case.
            // But for this environment, 'CREATE TABLE IF NOT EXISTS' won't change existing VARCHAR.
            // I'll add an ALTER query just to be safe, or assume I'll re-run clear-store.js.
            // Better: run clear-store.js again.
            await db.query(createTableQuery);
            try {
                // Migration to TEXT if it exists as VARCHAR
                await db.query("ALTER TABLE store_products MODIFY COLUMN image_url TEXT");
            } catch (e) {
                // Ignore if it fails or already text
            }

            console.log('Store Products table initialized');
            await storeController.seedProducts();
        } catch (error) {
            console.error('Error initializing store_products table:', error);
        }
    },

    seedProducts: async () => {
        try {
            const [rows] = await db.query('SELECT COUNT(*) as count FROM store_products');
            if (rows[0].count === 0) {
                const products = [
                    {
                        id: uuidv4(),
                        name: 'HUSA Official Kit (Promo) - Red',
                        price: 150.00,
                        description: 'Official promotional kit for HUSA Basketball fans. Red Home Color.',
                        category: 'Kit',
                        image_url: JSON.stringify(['/assets/store/542207433_17887122501357067_4280698276740856535_n..jpg']),
                        in_stock: true
                    },
                    {
                        id: uuidv4(),
                        name: 'HUSA Official Kit (Promo) - White',
                        price: 150.00,
                        description: 'Official promotional kit for HUSA Basketball fans. White Away Color.',
                        category: 'Kit',
                        image_url: JSON.stringify(['/assets/store/Gemini_Generated_Image_ceomz6ceomz6ceom.png']),
                        in_stock: true
                    },
                    {
                        id: uuidv4(),
                        name: 'HUSA Official Kit (Match) - Red',
                        price: 250.00,
                        description: 'Authentic match kit worn by HUSA players. Red Home Color.',
                        category: 'Kit',
                        image_url: JSON.stringify(['/assets/store/540271147_17886699834357067_1641371197587090454_n..jpg']),
                        in_stock: true
                    },
                    {
                        id: uuidv4(),
                        name: 'HUSA Official Kit (Match) - White',
                        price: 250.00,
                        description: 'Authentic match kit worn by HUSA players. White Away Color.',
                        category: 'Kit',
                        image_url: JSON.stringify(['/assets/store/e37a7414-1b79-4bc6-8769-c7858fbe33b4.png']),
                        in_stock: true
                    }
                ];

                for (const product of products) {
                    await db.query(
                        'INSERT INTO store_products (id, name, price, description, category, image_url, in_stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [product.id, product.name, product.price, product.description, product.category, product.image_url, product.in_stock]
                    );
                }
                console.log('Store Products seeded successfully');
            }
        } catch (error) {
            console.error('Error seeding store products:', error);
        }
    },

    getAll: async (req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM store_products ORDER BY created_at DESC');
            // Parse image_url JSON for frontend convenience? 
            // Or let frontend handle it. Let's let frontend handle it to keep API simple.
            res.json(rows);
        } catch (error) {
            console.error('Error fetching store products:', error);
            res.status(500).json({ message: 'Server error fetching products' });
        }
    },

    create: async (req, res) => {
        const { name, price, description, category, in_stock } = req.body;

        if (!name || !price) {
            return res.status(400).json({ message: 'Name and price are required' });
        }

        let imageUrls = [];

        // Handle Image Order Manifest
        if (req.body.image_order) {
            try {
                const order = JSON.parse(req.body.image_order);
                const uploadedFiles = req.files ? req.files.map(file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`) : [];
                let fileIndex = 0;

                imageUrls = order.map(token => {
                    if (token === 'new') {
                        const url = uploadedFiles[fileIndex];
                        fileIndex++;
                        return url;
                    } else if (token.startsWith('existing:')) {
                        return token.substring(9);
                    }
                    return token;
                }).filter(url => url);
            } catch (e) {
                console.error("Error parsing image_order", e);
                // Fallback
                if (req.files) imageUrls = req.files.map(f => `${req.protocol}://${req.get('host')}/uploads/${f.filename}`);
            }
        } else {
            // Legacy/Fallback behavior
            if (req.files && req.files.length > 0) {
                imageUrls = req.files.map(file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);
            } else if (req.body.image_url) {
                imageUrls = [req.body.image_url];
            }
        }

        const id = uuidv4();
        try {
            await db.query(
                'INSERT INTO store_products (id, name, price, description, category, image_url, in_stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [id, name, price, description || '', category || 'General', JSON.stringify(imageUrls), in_stock !== undefined ? (in_stock === 'true' || in_stock === true) : true]
            );
            res.status(201).json({ message: 'Product created successfully', id });
        } catch (error) {
            console.error('Error creating product:', error);
            res.status(500).json({ message: 'Server error creating product' });
        }
    },

    update: async (req, res) => {
        const { id } = req.params;
        const { name, price, description, category, in_stock } = req.body;

        // Base Update Query
        let query = 'UPDATE store_products SET name = ?, price = ?, description = ?, category = ?, in_stock = ?';
        let params = [name, price, description, category, in_stock === 'true' || in_stock === true];

        // Handle Images
        let imageUrls = null;

        if (req.body.image_order) {
            // New Manifest Logic
            try {
                const order = JSON.parse(req.body.image_order);
                const uploadedFiles = req.files ? req.files.map(file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`) : [];
                let fileIndex = 0;

                imageUrls = order.map(token => {
                    if (token === 'new') {
                        const url = uploadedFiles[fileIndex];
                        fileIndex++;
                        return url;
                    } else if (token.startsWith('existing:')) {
                        return token.substring(9);
                    }
                    return token;
                }).filter(url => url);
            } catch (e) {
                console.error("Error parsing image_order", e);
            }
        } else if (req.files && req.files.length > 0) {
            // Legacy overwrite logic
            imageUrls = req.files.map(file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);
        } else if (req.body.image_url) {
            // Manual URL override logic
            try {
                const parsed = JSON.parse(req.body.image_url);
                imageUrls = Array.isArray(parsed) ? parsed : [req.body.image_url];
            } catch (e) {
                imageUrls = [req.body.image_url];
            }
        }

        if (imageUrls !== null) {
            query += ', image_url = ?';
            params.push(JSON.stringify(imageUrls));
        }

        query += ' WHERE id = ?';
        params.push(id);

        try {
            await db.query(query, params);
            res.json({ message: 'Product updated successfully' });
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ message: 'Server error updating product' });
        }
    },

    delete: async (req, res) => {
        const { id } = req.params;
        try {
            await db.query('DELETE FROM store_products WHERE id = ?', [id]);
            res.json({ message: 'Product deleted successfully' });
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ message: 'Server error deleting product' });
        }
    }
};

module.exports = storeController;
