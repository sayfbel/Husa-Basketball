const express = require('express');
const router = express.Router();
const tryoutController = require('../controllers/tryoutController');

router.post('/', tryoutController.submitTryout);

module.exports = router;
