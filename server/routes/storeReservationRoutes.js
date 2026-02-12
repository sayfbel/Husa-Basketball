const express = require('express');
const router = express.Router();
const storeReservationController = require('../controllers/storeReservationController');

router.post('/', storeReservationController.create);
router.get('/', storeReservationController.getAll);
router.put('/:id/status', storeReservationController.updateStatus);

module.exports = router;
