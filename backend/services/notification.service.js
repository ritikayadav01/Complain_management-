import Notification from '../models/Notification.model.js';

/**
 * Notification Service
 * Handles creation and management of notifications
 */

class NotificationService {
  /**
   * Create a new notification
   */
  async createNotification(userId, type, title, message, complaintId = null) {
    try {
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        complaintId
      });

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create notification for complaint filed
   */
  async notifyComplaintFiled(userId, complaintId, complaintTitle) {
    return this.createNotification(
      userId,
      'complaint_filed',
      'Complaint Filed Successfully',
      `Your complaint "${complaintTitle}" has been filed and is under review.`,
      complaintId
    );
  }

  /**
   * Create notification for complaint assigned
   */
  async notifyComplaintAssigned(staffId, complaintId, complaintTitle) {
    return this.createNotification(
      staffId,
      'complaint_assigned',
      'New Complaint Assigned',
      `You have been assigned to handle complaint: "${complaintTitle}"`,
      complaintId
    );
  }

  /**
   * Create notification for status update
   */
  async notifyStatusUpdate(userId, complaintId, complaintTitle, newStatus) {
    const statusMessages = {
      reviewed: 'Your complaint has been reviewed',
      assigned: 'Your complaint has been assigned to a department',
      in_progress: 'Work on your complaint has started',
      resolved: 'Your complaint has been resolved',
      closed: 'Your complaint has been closed'
    };

    return this.createNotification(
      userId,
      'status_updated',
      'Complaint Status Updated',
      `${statusMessages[newStatus] || 'Status updated'}: "${complaintTitle}"`,
      complaintId
    );
  }

  /**
   * Create notification for new message
   */
  async notifyNewMessage(userId, complaintId, complaintTitle) {
    return this.createNotification(
      userId,
      'new_message',
      'New Message',
      `You have a new message regarding complaint: "${complaintTitle}"`,
      complaintId
    );
  }

  /**
   * Create notification for feedback request
   */
  async notifyFeedbackRequest(userId, complaintId, complaintTitle) {
    return this.createNotification(
      userId,
      'feedback_request',
      'Feedback Request',
      `Please provide feedback for your resolved complaint: "${complaintTitle}"`,
      complaintId
    );
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    return Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }
}

export default new NotificationService();




