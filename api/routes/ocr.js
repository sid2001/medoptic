const router = require('express').Router();
const { fileMiddleware } = require('../middlewares/file');
const { ocr } = require('../controllers/ocr');

router.post('/ocr', fileMiddleware, ocr);

module.exports = router;