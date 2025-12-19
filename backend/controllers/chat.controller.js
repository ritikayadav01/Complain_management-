import Chat from '../models/Chat.model.js';
import Complaint from '../models/Complaint.model.js';
import NotificationService from '../services/notification.service.js';

/**
 * Get chat messages for a complaint
 */
export const getChatMessages = async (req, res) => {
  try {
    const { complaintId } = req.params;

    // Verify complaint access
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check access
    if (req.user.role === 'user' && complaint.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Chat.find({ complaintId })
      .populate('senderId', 'name email role avatar')
      .sort('createdAt');

    // Mark messages as read
    await Chat.updateMany(
      {
        complaintId,
        'readBy.userId': { $ne: req.user._id }
      },
      {
        $push: {
          readBy: {
            userId: req.user._id,
            readAt: new Date()
          }
        }
      }
    );

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
};

/**
 * Send a chat message
 */
export const sendMessage = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { message } = req.body;

    // Verify complaint
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Access control
    if (
      req.user.role === 'user' &&
      complaint.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // ✅ CLOUDINARY ATTACHMENTS
    const attachments = (req.files || []).map(file => ({
      url: file.path,          // Cloudinary URL
      publicId: file.filename, // Needed for delete
      type: file.mimetype?.startsWith('video/') ? 'video' : 'image'
    }));

    // Create chat message
    const chatMessage = await Chat.create({
      complaintId,
      senderId: req.user._id,
      message,
      attachments,
      readBy: [
        {
          userId: req.user._id,
          readAt: new Date()
        }
      ]
    });

    await chatMessage.populate('senderId', 'name email role avatar');

    // Notification recipient
    const recipientId =
      req.user.role === 'user'
        ? complaint.assignedStaff || complaint.assignedDepartment
        : complaint.userId;

    if (recipientId) {
      await NotificationService.notifyNewMessage(
        recipientId,
        complaintId,
        complaint.title
      );
    }

    // Socket emit
    const io = req.app.get('io');
    if (io) {
      io.to(`complaint:${complaintId}`).emit('new_message', {
        complaintId,
        message: chatMessage
      });
    }

    res.status(201).json({
      message: 'Message sent successfully',
      chatMessage
    });
  } catch (error) {
    console.error('❌ sendMessage error:', error);
    res.status(500).json({
      message: 'Failed to send message',
      error: error.message
    });
  }
};






