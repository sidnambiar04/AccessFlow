import express from 'express';
import {
    getSales,
    createSales,
    updateSales,
    deleteSales,
} from '../controllers/resourceController.js';
import { authenticate, requirePermission, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Employees with 'sales' permission can view; only Admin can create/edit/delete
router.get('/', authenticate, requirePermission('sales'), getSales);
router.post('/', authenticate, requireAdmin, createSales);
router.put('/:id', authenticate, requireAdmin, updateSales);
router.delete('/:id', authenticate, requireAdmin, deleteSales);

export default router;