import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FiHome,
  FiFileText,
  FiPlus,
  FiList,
  FiBarChart2,
  FiUsers,
  FiSettings,
  FiMap,
  FiCheckSquare,
  FiUser
} from 'react-icons/fi';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  const userMenu = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/file-complaint', label: 'File New Complaint', icon: FiPlus },
    { path: '/complaints', label: 'My Complaints', icon: FiList },
    { path: '/profile', label: 'My Profile', icon: FiUser }
  ];

  const adminMenu = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: FiBarChart2 },
    { path: '/admin/complaints', label: 'All Complaints', icon: FiFileText },
    { path: '/admin/departments', label: 'Manage Departments', icon: FiSettings },
    { path: '/admin/users', label: 'Manage Users', icon: FiUsers },
    { path: '/admin/heatmap', label: 'Complaints Heatmap', icon: FiMap },
    { path: '/profile', label: 'My Profile', icon: FiUser }
  ];

  const staffMenu = [
    { path: '/staff/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/staff/complaints', label: 'My Assigned Complaints', icon: FiCheckSquare },
    { path: '/profile', label: 'My Profile', icon: FiUser }
  ];

  const getMenu = () => {
    if (user?.role === 'admin') return adminMenu;
    if (user?.role === 'department_staff') return staffMenu;
    return userMenu;
  };

  const menuItems = getMenu();

  return (
    <aside
      className={`bg-white shadow-lg border-r border-blue-100 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-0'
      } overflow-hidden`}
    >
      <div className="p-6 border-b border-blue-100">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Smart CMS</h1>
        <p className="text-xs text-gray-600 mt-1 font-medium">Complaint Management</p>
      </div>

      <nav className="px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium shadow-md'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;




