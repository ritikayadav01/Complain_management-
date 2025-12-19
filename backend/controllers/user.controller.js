import User from '../models/User.model.js';
import Complaint from '../models/Complaint.model.js';
import mongoose from 'mongoose';

/**
 * Get all users (admin only)
 */
export const getUsers = async (req, res) => {
  try {
    const { role, department, isActive, page = 1, limit = 10 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (department) query.department = department;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password')
      .populate('department', 'name category')
      .sort('createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

/**
 * Get single user by ID
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('department', 'name category description');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
};

/**
 * Update user (admin only)
 * Admin role cannot be changed - it's immutable
 */
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, department, phone, address, isActive } = req.body;

    // Check if user exists and get current user
    const currentUser = await User.findById(req.params.id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin role changes
    if (currentUser.role === 'admin') {
      // Admin users cannot have their role changed
      if (role && role !== 'admin') {
        return res.status(403).json({ 
          message: 'Admin role cannot be changed. Admin users are immutable.' 
        });
      }
      // Prevent admin from being deactivated
      if (isActive === false) {
        return res.status(403).json({ 
          message: 'Admin users cannot be deactivated.' 
        });
      }
    }

    // Prevent non-admin users from becoming admin
    if (role === 'admin' && currentUser.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Admin role cannot be assigned. Admin users are seeded via environment variables only.' 
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        role: currentUser.role === 'admin' ? 'admin' : role, // Force admin role if user is admin
        department,
        phone,
        address,
        isActive: currentUser.role === 'admin' ? true : isActive // Prevent admin deactivation
      },
      { new: true, runValidators: true }
    ).select('-password').populate('department', 'name');

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
};

/**
 * Delete user (admin only)
 * Admin users cannot be deleted or deactivated
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin deletion/deactivation
    if (user.role === 'admin') {
      return res.status(403).json({ 
        message: 'Admin users cannot be deleted or deactivated. Admin users are immutable.' 
      });
    }

    // Don't delete, just deactivate
    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async (req, res) => {
  try {
    const userIdParam = req.params.id;
    let userId = userIdParam ? new mongoose.Types.ObjectId(userIdParam) : req.user._id;

    console.log('\n🔍 BACKEND: getUserStats called');
    console.log('   userIdParam:', userIdParam);
    console.log('   userId:', String(userId));
    console.log('   reqUserId:', req.user ? String(req.user._id) : 'NO AUTH');

    // Count complaints by status
    console.log('   Querying complaints for userId:', String(userId));
    const total = await Complaint.countDocuments({ userId });
    console.log('   ✓ Total complaints:', total);
    
    const resolved = await Complaint.countDocuments({ userId, status: 'resolved' });
    console.log('   ✓ Resolved complaints:', resolved);
    
    const pending = await Complaint.countDocuments({
      userId,
      status: { $in: ['submitted', 'reviewed', 'assigned', 'in_progress'] }
    });
    console.log('   ✓ Pending complaints:', pending);

    const byStatus = await Complaint.aggregate([
      {
        $match: { userId }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('DEBUG stats result:', { total, resolved, pending, byStatusCount: byStatus.length });

    // Also fetch raw complaints for debugging
    const rawComplaints = await Complaint.find({ userId }).select('_id userId status createdAt title');
    console.log('   ✓ Raw complaints found:', rawComplaints.length);
    if (rawComplaints.length > 0) {
      console.log('     Sample complaints:');
      rawComplaints.slice(0, 3).forEach(c => {
        console.log(`       - ID: ${String(c._id)}, userId: ${String(c.userId)}, status: ${c.status}, title: ${c.title}`);
      });
    }

    // Return wrapped 'stats' object for consistent frontend parsing
    const responsePayload = {
      stats: {
        total,
        resolved,
        pending,
        byStatus
      }
    };
    console.log('✅ BACKEND: Sending response:', responsePayload);
    console.log('');
    
    res.json(responsePayload);
  } catch (error) {
    console.error('getUserStats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};




