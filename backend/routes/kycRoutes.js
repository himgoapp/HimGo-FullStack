const express = require('express');
const multer = require('multer');
const { uploadDocument, getKYCStatus, verifyKYC } = require('../controllers/kycController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// Routes
router.post('/upload-document', protect, upload.single('document'), uploadDocument);
router.get('/status', protect, getKYCStatus);
router.put('/verify', verifyKYC); // Should be admin-protected in production

module.exports = router;
