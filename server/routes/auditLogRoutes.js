import express from 'express';
import { getAuditLogs } from '../controllers/auditLogController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate, requireAdmin);
router.get('/', getAuditLogs);

export default router;