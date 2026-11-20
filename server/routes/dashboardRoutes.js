import express from 'express';
import { getEmployeeDashboard } from '../controllers/resourceController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getEmployeeDashboard);

export default router;