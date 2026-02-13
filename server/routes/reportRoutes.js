const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/', reportController.getReportsByPlayer);
router.post('/send', reportController.sendReport);
router.post('/respond', reportController.respondToReport);

module.exports = router;
