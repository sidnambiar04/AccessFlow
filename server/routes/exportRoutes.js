import express from 'express';
import { exportAccessMatrixCsv, exportAuditLogsCsv } from '../controllers/exportController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate, requireAdmin);
router.get('/access-matrix', exportAccessMatrixCsv);
router.get('/audit-logs', exportAuditLogsCsv);

export default router;