const express = require('express');
const router = express.Router();
const strategyController = require('../controllers/strategyController');

// Define routes
router.post('/', strategyController.saveStrategy);
router.get('/', strategyController.getStrategies);
router.delete('/:id', strategyController.deleteStrategy);

// Export router
module.exports = router;
