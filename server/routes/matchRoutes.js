const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

router.get('/scrape', matchController.scrapeMatches);

module.exports = router;
