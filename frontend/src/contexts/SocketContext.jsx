import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      const socketUrl =
        import.meta.env.VITE_SOCKET_URL ||
        (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5001');

      const newSocket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [isAuthenticated, token]);

  const joinComplaint = (complaintId) => {
    if (socket) {
      socket.emit('join_complaint', complaintId);
    }
  };

  const leaveComplaint = (complaintId) => {
    if (socket) {
      socket.emit('leave_complaint', complaintId);
    }
  };

  const value = {
    socket,
    joinComplaint,
    leaveComplaint
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};





