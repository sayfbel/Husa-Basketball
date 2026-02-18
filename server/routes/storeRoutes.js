const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const storeController = require('../controllers/storeController');

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

router.get('/', storeController.getAll);
router.post('/', upload.array('images', 5), storeController.create); // Allow up to 5 images
router.put('/:id', upload.array('images', 5), storeController.update);
router.delete('/:id', storeController.delete);

module.exports = router;
