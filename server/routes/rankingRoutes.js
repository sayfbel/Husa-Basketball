const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');

router.get('/', rankingController.getRankings);

module.exports = router;
