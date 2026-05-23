const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/news/');
    },
    filename: (req, file, cb) => {
        const ext = file.originalname.includes('.') ? file.originalname.substring(file.originalname.lastIndexOf('.')) : '';
        const safeName = Math.round(Math.random() * 1E9).toString(16);
        cb(null, Date.now() + '-' + safeName + ext);
    }
});
const upload = multer({ storage: storage });

router.get('/', newsController.getAllNews);
router.post('/', upload.single('image'), newsController.addNews);
router.put('/:id', upload.single('image'), newsController.updateNews);
router.delete('/:id', newsController.deleteNews);

module.exports = router;
