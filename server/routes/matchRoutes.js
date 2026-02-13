const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

router.get('/scrape', matchController.scrapeMatches);
router.post('/save', matchController.saveMatchSquad);
router.get('/player/:playerName', matchController.getPlayerMatches);

module.exports = router;
