import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { complaintAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const AssignedComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '' });

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
      <h1 className="page-heading">Assigned Complaints</h1>

      {/* Filters */}
      <div className="card">
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input"
          >
            <option value="">All</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Complaints List */}
      <div className="card">
        {complaints.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No assigned complaints</p>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <Link
                key={complaint._id}
                to={`/staff/complaints/${complaint._id}`}
                className="block p-4 border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{complaint.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {complaint.description}
                    </p>
                   
                    <div className="flex items-center gap-3 mt-3">
                      <StatusBadge status={complaint.status} />
                      <PriorityBadge priority={complaint.priority} />
                      <span className="text-xs text-gray-500 capitalize">
                        {complaint.category?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 ml-4">
                    {format(new Date(complaint.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedComplaints;





