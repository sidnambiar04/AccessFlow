import express from 'express';
import {
    getRequests,
    approveRequest,
    rejectRequest,
    getUsers,
    getUserById,
    updateUserRole,
    updateUserPermissions,
    updateUserStatus,
    getDashboardStats,
    getUserFileAccess,
    updateUserFileAccess,
} from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require valid authentication AND Admin role
router.use(authenticate, requireAdmin);

// Dashboard stats
router.get('/dashboard/stats', getDashboardStats);

// Registration requests
router.get('/requests', getRequests);
router.patch('/requests/:id/approve', approveRequest);
router.patch('/requests/:id/reject', rejectRequest);

// Employee management
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/permissions', updateUserPermissions);
router.patch('/users/:id/status', updateUserStatus);
router.get('/users/:id/file-access', getUserFileAccess);
router.patch('/users/:id/file-access', updateUserFileAccess);

export default router;