const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['license','registration','insurance','photo'], required: true },
    url: { type: String, required: true },
    publicId: { type: String, default: null },
    verified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);
