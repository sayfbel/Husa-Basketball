
const express = require('express');
const router = express.Router();

// Mock endpoint for sending reports
router.post('/send', (req, res) => {
    const { recipients, subject, message, priority, category } = req.body;

    console.log('--- NEW OFFICIAL REPORT ---');
    console.log(`To: ${recipients.join(', ')}`);
    console.log(`Subject: ${subject}`);
    console.log(`Category: ${category} | Priority: ${priority}`);
    console.log(`Content: ${message}`);
    console.log('---------------------------');

    res.status(200).json({ success: true, message: 'Report transmitted successfully' });
});

module.exports = router;
