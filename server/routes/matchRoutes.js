const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const matchController = require('../controllers/matchController');

// Configure Multer for local uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.get('/scrape', matchController.scrapeMatches);
router.get('/schedule', matchController.getCachedMatches);
router.get('/', matchController.getMatches);
router.post('/save', matchController.saveMatchSquad);
router.post('/intel', upload.array('images', 10), matchController.saveIntel);
router.get('/intel/:match_id', matchController.getIntel);
router.get('/player/:playerName', matchController.getPlayerMatches);

module.exports = router;
