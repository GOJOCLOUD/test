const express = require('express');
const { wordToTxt, pdfToTxt, batchWordToTxt, batchPdfToTxt } = require('../controllers/convertController');
const { singleUpload, uploadMultiple } = require('../middleware/fileUpload');

const router = express.Router();

router.post('/word', singleUpload, wordToTxt);
router.post('/pdf', singleUpload, pdfToTxt);
router.post('/batch/word', uploadMultiple, batchWordToTxt);
router.post('/batch/pdf', uploadMultiple, batchPdfToTxt);

module.exports = router;