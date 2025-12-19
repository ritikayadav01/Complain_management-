import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { complaintAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';
import { FiFileText, FiClock, FiCheckCircle } from 'react-icons/fi';

const StaffDashboard = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Get only complaints assigned to this staff member
      const response = await complaintAPI.getAll({ limit: 10, sort: '-createdAt' });
      const complaints = response.data.complaints;
      
      setRecentComplaints(complaints);
      setStats({
        total: complaints.length,
        pending: complaints.filter(c => c.status !== 'resolved' && c.status !== 'closed').length,
        resolved: complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length
      });
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <h1 className="page-heading">Staff Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Assigned Complaints</p>
              <p className="text-3xl font-bold text-blue-700 mt-2">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiFileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending</p>
              <p className="text-3xl font-bold text-yellow-700 mt-2">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FiClock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-emerald-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Resolved</p>
              <p className="text-3xl font-bold text-emerald-700 mt-2">{stats.resolved}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="card">
        <h2 className="section-heading">Assigned Complaints</h2>
        {recentComplaints.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No assigned complaints</p>
        ) : (
          <div className="space-y-4">
            {recentComplaints.map((complaint) => (
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
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-4 text-center">
          <Link to="/staff/complaints" className="text-primary-600 hover:text-primary-700 font-medium">
            View All →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;





