import { Server } from 'socket.io';


import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

/**
 * Initialize Socket.IO server
 */
export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Join role-specific room
    socket.join(`role:${socket.userRole}`);

    // Join complaint-specific room
    socket.on('join_complaint', (complaintId) => {
      socket.join(`complaint:${complaintId}`);
      console.log(`User ${socket.userId} joined complaint ${complaintId}`);
    });

    // Leave complaint room
    socket.on('leave_complaint', (complaintId) => {
      socket.leave(`complaint:${complaintId}`);
    });

    // Handle new message
    socket.on('new_message', (data) => {
      // Broadcast to complaint room
      socket.to(`complaint:${data.complaintId}`).emit('message_received', data);
    });

    // Handle status update
    socket.on('status_update', (data) => {
      // Notify user and staff
      io.to(`user:${data.userId}`).emit('complaint_status_updated', data);
      if (data.staffId) {
        io.to(`user:${data.staffId}`).emit('complaint_status_updated', data);
      }
    });

    // Handle new notification
    socket.on('new_notification', (data) => {
      io.to(`user:${data.userId}`).emit('notification_received', data);
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};





