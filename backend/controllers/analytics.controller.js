import Complaint from '../models/Complaint.model.js';
import Department from '../models/Department.model.js';
import User from '../models/User.model.js';

/**
 * Get dashboard analytics (admin)
 */
export const getDashboardAnalytics = async (req, res) => {
  try {
    // Complaints by category
    const byCategory = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Complaints by priority
    const byPriority = await Complaint.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Complaints by status
    const byStatus = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Unresolved complaints
    const unresolved = await Complaint.countDocuments({
      status: { $in: ['submitted', 'reviewed', 'assigned', 'in_progress'] }
    });

    // Total complaints
    const total = await Complaint.countDocuments();

    // Recent complaints (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recent = await Complaint.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Department workload
    const departmentWorkload = await Complaint.aggregate([
      {
        $match: { assignedDepartment: { $ne: null } }
      },
      {
        $group: {
          _id: '$assignedDepartment',
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          pending: {
            $sum: {
              $cond: [
                { $in: ['$status', ['submitted', 'reviewed', 'assigned', 'in_progress']] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $unwind: '$department'
      },
      {
        $project: {
          departmentName: '$department.name',
          total: 1,
          resolved: 1,
          pending: 1
        }
      },
      { $sort: { pending: -1 } }
    ]);

    res.json({
      total,
      recent,
      unresolved,
      byCategory,
      byPriority,
      byStatus,
      departmentWorkload
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};

/**
 * Get complaints trend (over time)
 */
export const getComplaintsTrend = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const trend = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({ trend });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch trend', error: error.message });
  }
};




