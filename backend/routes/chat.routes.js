import express from 'express';
import {
  getChatMessages,
  sendMessage
} from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import upload from '../middleware/cloudinaryUpload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/:complaintId', getChatMessages);
router.post('/:complaintId', upload.array('attachments', 5), sendMessage);

export default router;





