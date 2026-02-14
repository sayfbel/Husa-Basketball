const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

router.get('/', staffController.getAllStaff);
router.get('/profile', staffController.getStaffProfile);
router.put('/profile', staffController.updateStaffProfile);

module.exports = router;
