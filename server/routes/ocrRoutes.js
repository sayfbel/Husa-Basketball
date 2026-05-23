const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ocrController = require('../controllers/ocrController');

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

// POST /api/ocr/parse
// Body: { text: string, confidence: number }
// OCR runs in the browser; this endpoint only parses & validates the extracted text.
router.post('/parse', ocrController.parseMatchSheet);

// POST /api/ocr/vision
// Body: multipart/form-data with field 'image'
router.post('/vision', upload.single('image'), ocrController.parseVisionHandwriting);

module.exports = router;

