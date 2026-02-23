const express = require('express');
const router = express.Router();
const ocrController = require('../controllers/ocrController');

// POST /api/ocr/parse
// Body: { text: string, confidence: number }
// OCR runs in the browser; this endpoint only parses & validates the extracted text.
router.post('/parse', ocrController.parseMatchSheet);

module.exports = router;
