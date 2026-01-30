const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { protect } = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// @route   POST /api/upload
// @desc    Upload image to Cloudinary
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        // Convert buffer to base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'campus-issues',
            resource_type: 'image'
        });

        res.json({
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Failed to upload image', error: error.message });
    }
});

// @route   DELETE /api/upload/:public_id
// @desc    Delete image from Cloudinary
// @access  Private
router.delete('/:public_id', protect, async (req, res) => {
    try {
        const { public_id } = req.params;
        await cloudinary.uploader.destroy(`campus-issues/${public_id}`);
        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Failed to delete image' });
    }
});

module.exports = router;
