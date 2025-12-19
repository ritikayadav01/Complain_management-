import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { complaintAPI, userAPI } from '../../services/api';
import { FiPlus, FiFileText, FiClock, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

const UserDashboard = () => {
  const { user, token } = useAuth();
  const { socket } = useSocket();
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id && token) {
      fetchData();
    }
  }, [user?._id, token]);

  useEffect(() => {
    console.log('📊 STATS UPDATED:', stats);
  }, [stats]);

  // Listen for new complaints filed by this user
  useEffect(() => {
    if (!socket) return;

    const handleNewComplaint = (data) => {
      console.log('New complaint filed:', data);
      // Refresh dashboard data when a new complaint is created
      fetchData();
    };

    socket.on('complaint_filed', handleNewComplaint);

    return () => {
      socket.off('complaint_filed', handleNewComplaint);
    };
  }, [socket]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch stats and recent complaints separately so one failure won't break the other
      let statsData = { total: 0, pending: 0, resolved: 0 };
      try {
        console.log('📊 FRONTEND: Fetching stats for user:', user._id);
        const statsRes = await userAPI.getStats(user._id);
        console.log('📊 FRONTEND: Raw statsRes:', statsRes);
        console.log('📊 FRONTEND: statsRes.data:', statsRes.data);
        console.log('📊 FRONTEND: statsRes.data.stats:', statsRes.data?.stats);
        
        // Extract stats with safety check
        const extractedStats = statsRes.data?.stats || statsRes.data || statsData;
        console.log('📊 FRONTEND: Extracted stats:', extractedStats);
        
        // Ensure all required fields exist
        const finalStats = {
          total: extractedStats?.total || 0,
          pending: extractedStats?.pending || 0,
          resolved: extractedStats?.resolved || 0,
          byStatus: extractedStats?.byStatus || []
        };
        console.log('📊 FRONTEND: Final stats with defaults:', finalStats);
        
        statsData = finalStats;
        setStats(finalStats);
      } catch (sErr) {
        console.error('❌ Failed to fetch user stats:', sErr?.response || sErr);
        // If unauthorized, force logout to refresh auth state
        if (sErr.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        setStats(statsData);
      }

      try {
        const complaintsRes = await complaintAPI.getAll({ limit: 5, sort: '-createdAt' });
        setRecentComplaints(complaintsRes.data.complaints || []);
      } catch (cErr) {
        console.error('Failed to fetch recent complaints:', cErr?.response || cErr);
        if (cErr.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        setRecentComplaints([]);
      }
    } catch (error) {
      console.error('Unexpected dashboard error:', error?.response || error);
      const msg = error.response?.data?.message || error.message || 'Failed to load dashboard data';
      toast.error(msg);
      setStats({ total: 0, pending: 0, resolved: 0 });
      setRecentComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  console.log('📋 DASHBOARD RENDER: stats state =', stats);
  console.log('📋 DASHBOARD RENDER: loading state =', loading);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-heading">Dashboard</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="btn btn-secondary flex items-center gap-2"
            title="Refresh dashboard"
          >
            <FiRefreshCw className="w-5 h-5" />
            Refresh
          </button>
          <Link to="/file-complaint" className="btn btn-primary flex items-center gap-2">
            <FiPlus className="w-5 h-5" />
            File New Complaint
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Complaints</p>
              <p className="text-3xl font-bold text-blue-700 mt-2">{stats.total || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiFileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-amber-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending</p>
              <p className="text-3xl font-bold text-amber-700 mt-2">{stats.pending || 0}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <FiClock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-emerald-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Resolved</p>
              <p className="text-3xl font-bold text-emerald-700 mt-2">{stats.resolved || 0}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-indigo-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Resolution Rate</p>
              <p className="text-3xl font-bold text-indigo-700 mt-2">
                {stats.total > 0
                  ? Math.round((stats.resolved / stats.total) * 100)
                  : 0}%
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="card">
        <h2 className="section-heading">Recent Complaints</h2>
        {recentComplaints.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No complaints yet</p>
        ) : (
          <div className="space-y-4">
            {recentComplaints.map((complaint) => (
              <Link
                key={complaint._id}
                to={`/complaints/${complaint._id}`}
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
                  <span className="text-xs text-gray-500">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-4 text-center">
          <Link to="/complaints" className="text-blue-600 hover:text-blue-800 font-medium">
            View All Complaints →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;





