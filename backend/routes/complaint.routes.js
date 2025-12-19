import express from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateStatus,
  assignComplaint,
  resolveComplaint,
  submitFeedback,
  getComplaintsByLocation
} from '../controllers/complaint.controller.js';
import { authenticate, authorize, authorizeOwnerOrStaff } from '../middleware/auth.middleware.js';
import upload from '../middleware/cloudinaryUpload.js';

const cloudinaryArray = (field, maxCount) => (req, res, next) => {
  upload.array(field, maxCount)(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: 'File upload failed',
        error: err.message
      });
    }
    next();
  });
};

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/', cloudinaryArray('attachments', 5), createComplaint);
router.get('/', getComplaints);
router.get('/location', getComplaintsByLocation);
router.get('/:id', authorizeOwnerOrStaff, getComplaintById);
router.put('/:id/status', updateStatus);
router.put('/:id/assign', authorize('admin'), assignComplaint);
router.put('/:id/resolve', authorize('admin', 'department_staff'), cloudinaryArray('images', 5), resolveComplaint);
router.post('/:id/feedback', authorize('user'), submitFeedback);

export default router;





