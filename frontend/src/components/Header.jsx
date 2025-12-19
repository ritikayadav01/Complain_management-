import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiBell, FiLogOut, FiUser } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { notificationAPI } from '../services/api';
import { useSocket } from '../contexts/SocketContext';

const Header = ({ onMenuClick, onNotificationClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications count
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getAll({ limit: 1 });
      if (response.data?.notifications) {
        const unread = response.data.notifications.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  // Listen for new notifications via Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = () => {
      fetchUnreadCount();
    };

    socket.on('new_notification', handleNewNotification);
    return () => socket.off('new_notification', handleNewNotification);
  }, [socket]);

  const handleNotificationClick = () => {
    onNotificationClick();
    // Reset unread count when opening notifications
    setUnreadCount(0);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md border-b border-blue-100 px-6 py-4 flex items-center justify-between">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <FiMenu className="w-6 h-6 text-gray-600" />
      </button>

      <div className="flex items-center gap-4">
        <button
          onClick={handleNotificationClick}
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title={`${unreadCount} unread notifications`}
        >
          <FiBell className="w-6 h-6 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold overflow-hidden border-2 border-white shadow-md">
            {user?.avatar ? (
              <img
                src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}/${user.avatar}`}
                alt={user?.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to initial if image fails to load
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<span>${user?.name?.charAt(0).toUpperCase()}</span>`;
                }}
              />
            ) : (
              <span>{user?.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Logout"
          >
            <FiLogOut className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;




