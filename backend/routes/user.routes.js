import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats
} from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get user stats (before /:id so it doesn't match as param)
router.get('/stats', getUserStats);
router.get('/stats/:id', getUserStats);

// Admin only routes
router.get('/', authorize('admin'), getUsers);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

// Get single user (admin only) - must come last
router.get('/:id', authorize('admin'), getUserById);

export default router;





