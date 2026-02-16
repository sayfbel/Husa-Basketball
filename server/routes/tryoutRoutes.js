const express = require('express');
const router = express.Router();
const tryoutController = require('../controllers/tryoutController');

router.post('/', tryoutController.submitTryout);
router.get('/', tryoutController.getTryouts);
router.patch('/:id/status', tryoutController.updateTryoutStatus);

module.exports = router;
