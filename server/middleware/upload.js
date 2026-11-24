import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure storage destination & filename
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate clean unique filename: originalName-timestamp.pdf
        const ext = path.extname(file.originalname);
        const cleanName = path
            .basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9_-]/g, '_');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
    },
});

// File filter: accept only PDFs
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files (.pdf) are allowed!'), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB maximum size
    fileFilter,
});

export default upload;