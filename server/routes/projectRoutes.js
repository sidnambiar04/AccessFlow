import express from 'express';
import {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
} from '../controllers/resourceController.js';
import { authenticate, requirePermission, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Employees with 'projects' permission can view; only Admin can create/edit/delete
router.get('/', authenticate, requirePermission('projects'), getProjects);
router.post('/', authenticate, requireAdmin, createProject);
router.put('/:id', authenticate, requireAdmin, updateProject);
router.delete('/:id', authenticate, requireAdmin, deleteProject);

export default router;