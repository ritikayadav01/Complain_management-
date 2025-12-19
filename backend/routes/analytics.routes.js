import express from 'express';
import {
  getDashboardAnalytics,
  getComplaintsTrend
} from '../controllers/analytics.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardAnalytics);
router.get('/trend', getComplaintsTrend);

export default router;





