import path from 'path';
import { fileURLToPath } from 'url';
import Complaint from '../models/Complaint.model.js';
import AIService from '../services/ai.service.js';
import NotificationService from '../services/notification.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create a new complaint
 */

/**
 * CREATE COMPLAINT
 */
export const createComplaint = async (req, res) => {
  try {
    /* =======================
       1. READ FORM DATA
    ======================== */
    const {
      title,
      description,
      category,
      priority,
      address
    } = req.body;

    // Location comes as: location[lat], location[lng]
    const lat = parseFloat(req.body['location[lat]']);
    const lng = parseFloat(req.body['location[lng]']);

    /* =======================
       2. VALIDATION
    ======================== */
    if (!title || !description) {
      return res.status(400).json({
        message: 'Title and description are required',
        errors: {
          ...(title ? {} : { title: 'Title is required' }),
          ...(description ? {} : { description: 'Description is required' })
        }
      });
    }

    /* =======================
       3. AI FALLBACK
    ======================== */
    let aiResult = {
      category: category || 'other',
      priority: priority || 'medium',
      departmentId: null
    };

    if (!category || !priority) {
      aiResult = await AIService.processComplaint(title, description);
    }

    /* =======================
       4. ATTACHMENTS (CLOUDINARY)
    ======================== */
    const attachments = (req.files || []).map(file => {
      const rawUrl = file.path || file.secure_url || file.url || '';
      const normalizedPath = (() => {
        if (/^https?:\/\//i.test(rawUrl)) return rawUrl.replace(/^http:\/\//i, 'https://');
        const idx = String(rawUrl).indexOf('uploads');
        return idx >= 0 ? String(rawUrl).slice(idx).replace(/\\/g, '/') : String(rawUrl).replace(/\\/g, '/');
      })();

      return {
        filename: file.filename || file.originalname,
        publicId: file.filename || file.public_id,
        originalName: file.originalname,
        path: normalizedPath,
        mimetype: file.mimetype,
        size: file.size
      };
    });

    /* =======================
       5. LOCATION
    ======================== */
    const locationData = {
      type: 'Point',
      coordinates: [0, 0],
      address: address || ''
    };

    if (!isNaN(lat) && !isNaN(lng)) {
      locationData.coordinates = [lng, lat];
    }

    /* =======================
       6. CREATE COMPLAINT
    ======================== */
    const complaint = await Complaint.create({
      title,
      description,
      category: category || aiResult.category,
      priority: priority || aiResult.priority,
      userId: req.user._id,
      assignedDepartment: aiResult.departmentId,
      location: locationData,
      attachments,
      aiCategory: aiResult.category,
      aiPriority: aiResult.priority,
      aiAssignedDepartment: aiResult.departmentId,
      timeline: [{
        status: 'submitted',
        updatedBy: req.user._id,
        comment: 'Complaint submitted',
        timestamp: new Date()
      }]
    });

    /* =======================
       7. POPULATE
    ======================== */
    await complaint.populate('userId', 'name email');
    if (complaint.assignedDepartment) {
      await complaint.populate('assignedDepartment', 'name category');
    }

    /* =======================
       8. NOTIFICATIONS
    ======================== */
    await NotificationService.notifyComplaintFiled(
      req.user._id,
      complaint._id,
      complaint.title
    );

    /* =======================
       9. SOCKET EVENTS
    ======================== */
    const io = req.app.get('io');

    if (io) {
      io.to('role:admin').emit('new_complaint', {
        complaintId: complaint._id,
        title: complaint.title,
        category: complaint.category,
        priority: complaint.priority
      });

      io.to(`user:${req.user._id}`).emit('complaint_filed', {
        complaintId: complaint._id,
        title: complaint.title,
        status: complaint.status
      });
    }

    /* =======================
       10. RESPONSE
    ======================== */
    res.status(201).json({
      message: 'Complaint filed successfully',
      complaint
    });

  } catch (error) {
    console.error('CREATE COMPLAINT ERROR:', error);
    res.status(500).json({
      message: 'Failed to create complaint',
      error: error.message
    });
  }
};


/**
 * Get all complaints (with filters)
 */
export const getComplaints = async (req, res) => {
  try {
    const {
      status,
      category,
      priority,
      userId,
      assignedDepartment,
      assignedStaff,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    // Role-based filtering
    if (req.user.role === 'user') {
      query.userId = req.user._id;
    } else if (req.user.role === 'department_staff') {
      query.assignedStaff = req.user._id;
    }

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (userId && req.user.role === 'admin') query.userId = userId;
    if (assignedDepartment) query.assignedDepartment = assignedDepartment;
    if (assignedStaff && req.user.role === 'admin') query.assignedStaff = assignedStaff;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const complaints = await Complaint.find(query)
      .populate('userId', 'name email')
      .populate('assignedDepartment', 'name category')
      .populate('assignedStaff', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(query);

    res.json({
      complaints,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch complaints', error: error.message });
  }
};

/**
 * Get single complaint by ID
 */
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('assignedDepartment', 'name category description')
      .populate('assignedStaff', 'name email phone')
      .populate('timeline.updatedBy', 'name email role');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check access
    if (req.user.role === 'user' && complaint.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ complaint });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch complaint', error: error.message });
  }
};

/**
 * Update complaint status
 */
export const updateStatus = async (req, res) => {
  try {
    const { status, comment } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Do not allow updates once complaint is resolved or closed
    if (['resolved', 'closed'].includes(complaint.status)) {
      return res.status(400).json({ message: 'Resolved/closed complaints cannot be updated' });
    }

    // Check permissions
    if (req.user.role === 'user' && status !== 'submitted') {
      return res.status(403).json({ message: 'Users can only submit complaints' });
    }

    // Department staff can only update complaints assigned to them
    if (req.user.role === 'department_staff') {
      if (!complaint.assignedStaff || complaint.assignedStaff.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not assigned to this complaint' });
      }

      // Staff can only move between in_progress and resolved
      if (!['in_progress', 'resolved'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status for staff. Allowed: in_progress, resolved' });
      }
    }

    // Update status
    complaint.status = status;
    complaint.timeline.push({
      status,
      updatedBy: req.user._id,
      comment: comment || `Status updated to ${status}`,
      timestamp: new Date()
    });

    await complaint.save();

    // Populate for response
    await complaint.populate('userId', 'name email');
    await complaint.populate('assignedStaff', 'name email');

    // Create notification
    await NotificationService.notifyStatusUpdate(
      complaint.userId._id,
      complaint._id,
      complaint.title,
      status
    );

    // Emit socket events to both parties
    const io = req.app.get('io');
    if (io) {
      // Broadcast to complaint room
      io.to(`complaint:${complaint._id}`).emit('status_update', {
        complaintId: complaint._id,
        status,
        userId: complaint.userId._id,
        staffId: complaint.assignedStaff?._id
      });
      
      // Notify user directly
      io.to(`user:${complaint.userId._id}`).emit('complaint_status_updated', {
        complaintId: complaint._id,
        title: complaint.title,
        status,
        message: `Your complaint status changed to ${status}`
      });
      
      // Notify assigned staff
      if (complaint.assignedStaff?._id) {
        io.to(`user:${complaint.assignedStaff._id}`).emit('assigned_complaint_updated', {
          complaintId: complaint._id,
          title: complaint.title,
          status
        });
      }
    }

    res.status(200).json({ message: 'Status updated successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
};

/**
 * Assign complaint to staff
 */
export const assignComplaint = async (req, res) => {
  try {
    const { staffId, departmentId } = req.body;
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can assign complaints' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Update assignment
    if (departmentId) complaint.assignedDepartment = departmentId;
    if (staffId) complaint.assignedStaff = staffId;

    if (complaint.status === 'submitted' || complaint.status === 'reviewed') {
      complaint.status = 'assigned';
      complaint.timeline.push({
        status: 'assigned',
        updatedBy: req.user._id,
        comment: `Complaint assigned${staffId ? ' to staff' : ' to department'}`,
        timestamp: new Date()
      });
    }

    await complaint.save();

    // Populate for response
    await complaint.populate('assignedDepartment', 'name');
    await complaint.populate('assignedStaff', 'name email');

    // Create notifications
    if (staffId) {
      await NotificationService.notifyComplaintAssigned(
        staffId,
        complaint._id,
        complaint.title
      );
    }

    await NotificationService.notifyStatusUpdate(
      complaint.userId,
      complaint._id,
      complaint.title,
      'assigned'
    );

    // Emit socket events
    const io = req.app.get('io');
    if (io) {
      // Notify assigned staff
      if (staffId) {
        io.to(`user:${staffId}`).emit('new_assignment', {
          complaintId: complaint._id,
          title: complaint.title,
          category: complaint.category,
          priority: complaint.priority,
          message: 'New complaint assigned to you'
        });
      }
      
      // Notify citizen
      io.to(`user:${complaint.userId}`).emit('complaint_assigned', {
        complaintId: complaint._id,
        title: complaint.title,
        message: 'Your complaint has been assigned to staff'
      });
      
      // Notify admins
      io.to('role:admin').emit('complaint_assigned', {
        complaintId: complaint._id,
        assignedTo: complaint.assignedStaff?.name || 'Unassigned',
        title: complaint.title
      });
    }

    res.json({ message: 'Complaint assigned successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: 'Failed to assign complaint', error: error.message });
  }
};

/**
 * Resolve complaint
 */
export const resolveComplaint = async (req, res) => {
  try {
    const { resolutionDetails } = req.body;
    const { id } = req.params;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check permissions
    if (req.user.role === 'user') {
      return res.status(403).json({ message: 'Users cannot resolve complaints' });
    }

    // Require resolution details
    if (!resolutionDetails || !resolutionDetails.trim()) {
      return res.status(400).json({ message: 'Resolution details are required' });
    }

    // Require at least one resolution file
    const imageFiles = Array.isArray(req.files)
      ? req.files
      : (req.files?.images || req.files?.attachments || []);
    if (!imageFiles.length) {
      return res.status(400).json({ message: 'At least one resolution file is required to resolve a complaint' });
    }

    // Prepare resolution images (normalize path to start at uploads/)
    const resolutionImages = imageFiles.map(file => {
      const rawUrl = file.path || file.secure_url || file.url || '';
      const publicPath = /^https?:\/\//i.test(rawUrl)
        ? rawUrl.replace(/^http:\/\//i, 'https://')
        : (() => {
            const idx = String(rawUrl).indexOf('uploads');
            return idx >= 0 ? String(rawUrl).slice(idx).replace(/\\/g, '/') : (file.filename || '').replace(/\\/g, '/');
          })();
      return {
        filename: file.filename,
        publicId: file.filename || file.public_id,
        originalName: file.originalname,
        path: publicPath,
        mimetype: file.mimetype
      };
    });

    // Generate resolution summary with AI
    const resolutionSummary = await AIService.generateResolutionSummary(
      complaint.title,
      complaint.description,
      resolutionDetails
    );

    // Update complaint
    complaint.status = 'resolved';
    complaint.resolutionSummary = resolutionSummary;
    complaint.resolutionImages = resolutionImages;
    complaint.timeline.push({
      status: 'resolved',
      updatedBy: req.user._id,
      comment: resolutionDetails || 'Complaint resolved',
      timestamp: new Date()
    });

    await complaint.save();

    // Populate for response
    await complaint.populate('userId', 'name email');

    // Create notifications
    await NotificationService.notifyStatusUpdate(
      complaint.userId._id,
      complaint._id,
      complaint.title,
      'resolved'
    );

    await NotificationService.notifyFeedbackRequest(
      complaint.userId._id,
      complaint._id,
      complaint.title
    );

    // Emit socket events
    const io = req.app.get('io');
    if (io) {
      // Notify citizen that complaint is resolved
      io.to(`user:${complaint.userId._id}`).emit('complaint_resolved', {
        complaintId: complaint._id,
        title: complaint.title,
        message: 'Your complaint has been resolved',
        resolutionSummary: resolutionSummary
      });
      
      // Broadcast to complaint room
      io.to(`complaint:${complaint._id}`).emit('status_update', {
        complaintId: complaint._id,
        status: 'resolved',
        resolutionSummary
      });
      
      // Notify admins
      io.to('role:admin').emit('complaint_resolved', {
        complaintId: complaint._id,
        title: complaint.title,
        resolvedBy: req.user.name
      });
    }

    res.json({ message: 'Complaint resolved successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: 'Failed to resolve complaint', error: error.message });
  }
};

/**
 * Submit feedback
 */
export const submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { id } = req.params;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if user owns the complaint
    if (complaint.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if already resolved
    if (complaint.status !== 'resolved') {
      return res.status(400).json({ message: 'Complaint must be resolved before feedback' });
    }

    // Update feedback
    complaint.feedback = {
      rating,
      comment,
      submittedAt: new Date()
    };
    complaint.status = 'closed';

    await complaint.save();

    res.json({ message: 'Feedback submitted successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit feedback', error: error.message });
  }
};

/**
 * Get complaints by location (heatmap data)
 * If lat/lng provided, returns nearby complaints within radius
 * If not provided, returns all complaints with valid locations
 */
export const getComplaintsByLocation = async (req, res) => {
  try {
    const { lat, lng, radius = 50000 } = req.query; // radius in meters

    let query = {};

    const parsedLat = lat !== undefined ? parseFloat(lat) : NaN;
    const parsedLng = lng !== undefined ? parseFloat(lng) : NaN;
    const parsedRadius = Number.isFinite(parseInt(radius)) ? parseInt(radius) : 50000;

    if (Number.isFinite(parsedLat) && Number.isFinite(parsedLng)) {
      // Find complaints near the specified location
      query = {
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parsedLng, parsedLat]
            },
            $maxDistance: parsedRadius
          }
        }
      };
    } else {
      // Return all complaints with valid locations (not [0,0] or null)
      query = {
        'location.coordinates.0': { $exists: true, $ne: 0 },
        'location.coordinates.1': { $exists: true, $ne: 0 }
      };
    }

    const complaints = await Complaint.find(query)
      .select('title category priority status location createdAt')
      .limit(1000); // Limit to prevent performance issues

    res.json({ complaints });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch location data', error: error.message });
  }
};




