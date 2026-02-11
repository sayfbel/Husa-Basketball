const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

router.post('/kids', reservationController.submitReservation);

module.exports = router;
