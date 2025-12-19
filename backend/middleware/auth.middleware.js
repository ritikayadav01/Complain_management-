import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

/**
 * Middleware to verify JWT token and authenticate user
 */
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Authentication error', error: error.message });
  }
};

/**
 * Middleware to check if user has required role
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${roles.join(' or ')}` 
      });
    }

    next();
  };
};

/**
 * Middleware to check if user owns the resource or is admin/staff
 */
export const authorizeOwnerOrStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const Complaint = (await import('../models/Complaint.model.js')).default;
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Admin and department staff can access
    if (req.user.role === 'admin' || req.user.role === 'department_staff') {
      return next();
    }

    // User can only access their own complaints
    if (complaint.userId.toString() === req.user._id.toString()) {
      return next();
    }

    res.status(403).json({ message: 'Access denied' });
  } catch (error) {
    res.status(500).json({ message: 'Authorization error', error: error.message });
  }
};





