import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { complaintAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: ''
  });

  useEffect(() => {
    fetchComplaints();
  }, [filters]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintAPI.getAll(filters);
      setComplaints(response.data.complaints);
    } catch (error) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <h1 className="page-heading">All Complaints</h1>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input"
            >
              <option value="">All</option>
              <option value="submitted">Submitted</option>
              <option value="reviewed">Reviewed</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="input"
            >
              <option value="">All</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="sanitation">Sanitation</option>
              <option value="water_supply">Water Supply</option>
              <option value="electricity">Electricity</option>
              <option value="traffic">Traffic</option>
              <option value="waste_management">Waste Management</option>
              <option value="parks">Parks</option>
              <option value="security">Security</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="input"
            >
              <option value="">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="card">
        {complaints.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No complaints found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-blue-100 bg-blue-50">
                  <th className="text-left p-3 font-semibold text-gray-800">Title</th>
                  <th className="text-left p-3 font-semibold text-gray-800">User</th>
                  <th className="text-left p-3 font-semibold text-gray-800">Status</th>
                  <th className="text-left p-3 font-semibold text-gray-800">Priority</th>
                  <th className="text-left p-3 font-semibold text-gray-800">Category</th>
                  <th className="text-left p-3 font-semibold text-gray-800">Date</th>
                  <th className="text-left p-3 font-semibold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint._id} className="border-b border-blue-100 hover:bg-blue-50 transition-colors">
                    <td className="p-3">
                      <Link
                        to={`/admin/complaints/${complaint._id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {complaint.title}
                      </Link>
                    </td>
                    <td className="p-3">{complaint.userId?.name || 'N/A'}</td>
                    <td className="p-3">
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td className="p-3">
                      <PriorityBadge priority={complaint.priority} />
                    </td>
                    <td className="p-3 capitalize">
                      {complaint.category?.replace('_', ' ')}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {format(new Date(complaint.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="p-3">
                      <Link
                        to={`/admin/complaints/${complaint._id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminComplaints;





