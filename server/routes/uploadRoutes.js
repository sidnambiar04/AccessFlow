import express from 'express';
import upload from '../middleware/upload.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// @desc    Upload a single PDF document
// @route   POST /api/upload
// @access  Private (Admin only)
router.post('/', authenticate, requireAdmin, (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please select a PDF file to upload' });
        }

        const section = req.query?.section || req.body?.section || '';
        const subfolder = (section === 'sales' || section === 'projects') ? `/${section}` : '';

        res.status(201).json({
            success: true,
            fileName: req.file.originalname,
            fileUrl: `/uploads${subfolder}/${req.file.filename}`,
        });
    });
});

export default router;