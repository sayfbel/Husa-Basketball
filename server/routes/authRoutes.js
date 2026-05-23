const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/players');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/seed
router.get('/seed', authController.seedUsers);

// POST /api/auth/add-user
router.post('/add-user', upload.single('photo'), authController.addUser);

// POST /api/auth/preview-bg-remove
router.post('/preview-bg-remove', upload.single('photo'), authController.previewBgRemove);

// GET /api/auth/users
router.get('/users', authController.getUsers);

// PUT /api/auth/users/:id
router.put('/users/:id', authController.updateUser);

// DELETE /api/auth/users/:id
router.delete('/users/:id', authController.deleteUser);

module.exports = router;
