import express from 'express';
import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  addStaff,
  removeStaff,
  getDepartmentWorkload
} from '../controllers/department.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.get('/:id/workload', getDepartmentWorkload);

// Admin only routes
router.post('/', authorize('admin'), createDepartment);
router.put('/:id', authorize('admin'), updateDepartment);
router.post('/:id/staff', authorize('admin'), addStaff);
router.delete('/:id/staff', authorize('admin'), removeStaff);

export default router;





