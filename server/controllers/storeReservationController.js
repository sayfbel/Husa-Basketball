const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const storeReservationController = {
    initTable: async () => {
        const sql = `
            CREATE TABLE IF NOT EXISTS store_reservations (
                id VARCHAR(36) PRIMARY KEY,
                product_name VARCHAR(255) NOT NULL,
                price VARCHAR(50) NOT NULL,
                customer_name VARCHAR(255) NOT NULL,
                location VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                size VARCHAR(10) NOT NULL,
                color VARCHAR(20) NOT NULL,
                status ENUM('pending', 'contacted', 'completed', 'cancelled') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        try {
            await db.query(sql);
            console.log('Store Reservations table initialized');
        } catch (err) {
            console.error('Error initializing store_reservations table:', err);
        }
    },

    create: async (req, res) => {
        const { product_name, price, customer_name, location, phone, size, color } = req.body;

        if (!product_name || !price || !customer_name || !location || !phone || !size || !color) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const id = uuidv4();
        const sql = `
            INSERT INTO store_reservations (id, product_name, price, customer_name, location, phone, size, color)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        try {
            await db.query(sql, [id, product_name, price, customer_name, location, phone, size, color]);
            res.status(201).json({ message: 'Order received successfully', orderId: id });
        } catch (err) {
            console.error('Error creating store reservation:', err);
            res.status(500).json({ message: 'Server error while processing order' });
        }
    },

    getAll: async (req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM store_reservations ORDER BY created_at DESC');
            res.json(rows);
        } catch (err) {
            console.error('Error fetching store reservations:', err);
            res.status(500).json({ message: 'Server error while fetching orders' });
        }
    },

    updateStatus: async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        try {
            await db.query('UPDATE store_reservations SET status = ? WHERE id = ?', [status, id]);
            res.json({ message: 'Order status updated successfully' });
        } catch (err) {
            console.error('Error updating order status:', err);
            res.status(500).json({ message: 'Server error while updating status' });
        }
    }
};

module.exports = storeReservationController;
