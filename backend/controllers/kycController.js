const Driver = require('../models/Driver');
const Document = require('../models/Document');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary (set in .env)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// @route   POST /api/kyc/upload-document
// @desc    Upload KYC document (license, registration, insurance, photo)
// @access  Private
exports.uploadDocument = async (req, res, next) => {
    try {
        const { documentType } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No file provided' });
        }

        if (!['driving_license', 'registration', 'insurance', 'profile_photo'].includes(documentType)) {
            return res.status(400).json({ message: 'Invalid document type' });
        }

        // Upload to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream({
            folder: `himgo/kyc/${req.driver._id}/${documentType}`,
            resource_type: 'auto'
        }, async (error, result) => {
            if (error) {
                return res.status(500).json({ message: 'Upload failed', error: error.message });
            }

            // Save document to database
            const document = new Document({
                driver: req.driver._id,
                type: documentType,
                fileUrl: result.secure_url,
                verificationStatus: 'pending'
            });

            await document.save();

            // Update driver documents object
            const docKey = documentType.split('_')[1] || documentType;
            const driver = await Driver.findByIdAndUpdate(
                req.driver._id,
                {
                    [`documents.${docKey}`]: {
                        url: result.secure_url,
                        verified: false
                    }
                },
                { new: true }
            );

            res.status(200).json({
                message: 'Document uploaded successfully',
                document: {
                    type: documentType,
                    url: result.secure_url,
                    verificationStatus: 'pending'
                }
            });
        });

        // Pipe file buffer to Cloudinary
        uploadStream.end(file.buffer);
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ message: 'Error uploading document' });
    }
};

// @route   GET /api/kyc/status
// @desc    Get KYC status and documents
// @access  Private
exports.getKYCStatus = async (req, res, next) => {
    try {
        const driver = await Driver.findById(req.driver._id);
        const documents = await Document.find({ driver: req.driver._id });

        const status = {
            kycStatus: driver.kycStatus,
            documents: driver.documents,
            allDocuments: documents,
            isComplete: driver.documents.license && 
                       driver.documents.registration && 
                       driver.documents.insurance && 
                       driver.documents.photo
        };

        res.status(200).json(status);
    } catch (error) {
        console.error('Error fetching KYC status:', error);
        res.status(500).json({ message: 'Error fetching KYC status' });
    }
};

// @route   PUT /api/kyc/verify (Admin only)
// @desc    Verify KYC documents and approve/reject driver
// @access  Private (Admin)
exports.verifyKYC = async (req, res, next) => {
    try {
        const { driverId, status, rejectionReason } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Update all documents status
        await Document.updateMany(
            { driver: driverId },
            { 
                verificationStatus: status === 'approved' ? 'verified' : 'rejected',
                rejectionReason: rejectionReason || null,
                verifiedAt: Date.now(),
                verifiedBy: req.user?.id || 'admin' // Assuming admin middleware exists
            }
        );

        // Update driver KYC status
        const driver = await Driver.findByIdAndUpdate(
            driverId,
            { kycStatus: status },
            { new: true }
        );

        res.status(200).json({
            message: `KYC ${status} successfully`,
            driver
        });
    } catch (error) {
        console.error('Error verifying KYC:', error);
        res.status(500).json({ message: 'Error verifying KYC' });
    }
};

module.exports = exports;
