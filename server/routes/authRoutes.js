const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/seed
router.get('/seed', authController.seedUsers);

module.exports = router;
