import Department from '../models/Department.model.js';
import User from '../models/User.model.js';
import Complaint from '../models/Complaint.model.js';

/**
 * Create a new department
 */
export const createDepartment = async (req, res) => {
  try {
    const { name, description, category, contactEmail, contactPhone } = req.body;

    const department = await Department.create({
      name,
      description,
      category,
      contactEmail,
      contactPhone
    });

    res.status(201).json({
      message: 'Department created successfully',
      department
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Department with this name already exists' });
    }
    res.status(500).json({ message: 'Failed to create department', error: error.message });
  }
};

/**
 * Get all departments
 */
export const getDepartments = async (req, res) => {
  try {
    const { isActive } = req.query;
    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const departments = await Department.find(query)
      .populate('head', 'name email')
      .populate('staff', 'name email')
      .sort('name');

    res.json({ departments });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch departments', error: error.message });
  }
};

/**
 * Get single department by ID
 */
export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('head', 'name email phone')
      .populate('staff', 'name email phone role');

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({ department });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch department', error: error.message });
  }
};

/**
 * Update department
 */
export const updateDepartment = async (req, res) => {
  try {
    const { name, description, category, head, contactEmail, contactPhone, isActive } = req.body;

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        category,
        head,
        contactEmail,
        contactPhone,
        isActive
      },
      { new: true, runValidators: true }
    ).populate('head', 'name email').populate('staff', 'name email');

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({ message: 'Department updated successfully', department });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update department', error: error.message });
  }
};

/**
 * Add staff to department
 */
export const addStaff = async (req, res) => {
  try {
    const { staffId } = req.body;
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check if staff already in department
    if (department.staff.includes(staffId)) {
      return res.status(400).json({ message: 'Staff already in department' });
    }

    department.staff.push(staffId);
    await department.save();

    // Update user's department
    await User.findByIdAndUpdate(staffId, { department: department._id });

    await department.populate('staff', 'name email');

    res.json({ message: 'Staff added successfully', department });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add staff', error: error.message });
  }
};

/**
 * Remove staff from department
 */
export const removeStaff = async (req, res) => {
  try {
    const { staffId } = req.body;
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    department.staff = department.staff.filter(
      id => id.toString() !== staffId
    );
    await department.save();

    // Update user's department
    await User.findByIdAndUpdate(staffId, { department: null });

    res.json({ message: 'Staff removed successfully', department });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove staff', error: error.message });
  }
};

/**
 * Get department workload (complaints count by status)
 */
export const getDepartmentWorkload = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const workload = await Complaint.aggregate([
      {
        $match: { assignedDepartment: department._id }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Complaint.countDocuments({ assignedDepartment: department._id });

    res.json({
      department: department.name,
      total,
      byStatus: workload,
      staffCount: department.staff.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch workload', error: error.message });
  }
};





