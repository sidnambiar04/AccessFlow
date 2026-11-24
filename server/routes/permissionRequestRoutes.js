import express from 'express';
import {
    createPermissionRequest,
    getMyRequests,
    getAllPermissionRequests,
    reviewPermissionRequest,
} from '../controllers/permissionRequestController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Employee routes
router.post('/', createPermissionRequest);
router.get('/my', getMyRequests);

// Admin routes
router.get('/', requireAdmin, getAllPermissionRequests);
router.patch('/:id/review', requireAdmin, reviewPermissionRequest);

export default router;