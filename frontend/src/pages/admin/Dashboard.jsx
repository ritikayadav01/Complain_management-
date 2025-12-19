import { useEffect, useState } from 'react';
import { analyticsAPI } from '../../services/api';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { FiFileText, FiAlertCircle, FiClock, FiCheckCircle } from 'react-icons/fi';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsAPI.getDashboard();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast.error('Failed to load analytics');
      // Set default empty data so page doesn't crash
      setAnalytics({
        total: 0,
        recent: 0,
        unresolved: 0,
        byCategory: [],
        byPriority: [],
        byStatus: [],
        departmentWorkload: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <h1 className="page-heading">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Complaints</p>
              <p className="text-3xl font-bold text-blue-700 mt-2">{analytics?.total || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiFileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Unresolved</p>
              <p className="text-3xl font-bold text-yellow-700 mt-2">
                {analytics?.unresolved || 0}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FiClock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-emerald-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Recent (7 days)</p>
              <p className="text-3xl font-bold text-emerald-700 mt-2">{analytics?.recent || 0}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="section-heading">Complaints by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics?.byCategory || []}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {(analytics?.byCategory || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="section-heading">Complaints by Priority</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.byPriority || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Workload */}
      <div className="card">
        <h3 className="section-heading">Department Workload</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Department</th>
                <th className="text-right p-2">Total</th>
                <th className="text-right p-2">Pending</th>
                <th className="text-right p-2">Resolved</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.departmentWorkload?.map((dept, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{dept.departmentName}</td>
                  <td className="text-right p-2">{dept.total}</td>
                  <td className="text-right p-2 text-yellow-600">{dept.pending}</td>
                  <td className="text-right p-2 text-green-600">{dept.resolved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;




