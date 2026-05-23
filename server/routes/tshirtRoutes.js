const express = require('express');
const router = express.Router();
const tshirtController = require('../controllers/tshirtController');

// All endpoints prefix: /api/tshirts
router.get('/', tshirtController.getAllTshirts);
router.get('/available', tshirtController.getAvailableTshirts);
router.post('/', tshirtController.addTshirt);
router.delete('/:number', tshirtController.deleteTshirt);

module.exports = router;
