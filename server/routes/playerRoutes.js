const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

// GET /api/players
router.get('/', playerController.getAllPlayers);
router.get('/profile', playerController.getPlayerProfile);
router.put('/profile', playerController.updatePlayerProfile);

module.exports = router;
