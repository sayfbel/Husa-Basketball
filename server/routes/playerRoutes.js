const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

// GET /api/players
router.get('/', playerController.getAllPlayers);

module.exports = router;
