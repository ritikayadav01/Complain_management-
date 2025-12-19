import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User pages
import UserDashboard from './pages/user/Dashboard';
import FileComplaint from './pages/user/FileComplaint';
import ComplaintDetails from './pages/user/ComplaintDetails';
import ComplaintHistory from './pages/user/ComplaintHistory';
import Profile from './pages/user/Profile';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminComplaints from './pages/admin/Complaints';
import AdminComplaintDetails from './pages/admin/ComplaintDetails';
import ManageDepartments from './pages/admin/ManageDepartments';
import ManageUsers from './pages/admin/ManageUsers';
import Heatmap from './pages/admin/Heatmap';

// Department staff pages
import StaffDashboard from './pages/staff/Dashboard';
import AssignedComplaints from './pages/staff/AssignedComplaints';
import StaffComplaintDetails from './pages/staff/ComplaintDetails';

// Shared components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* User routes */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="file-complaint"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <FileComplaint />
                  </ProtectedRoute>
                }
              />
              <Route
                path="complaints/:id"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <ComplaintDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="complaints"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <ComplaintHistory />
                  </ProtectedRoute>
                }
              />

              {/* Profile route - accessible to all authenticated users */}
              <Route
                path="profile"
                element={
                  <Profile />
                }
              />

              {/* Admin routes */}
              <Route
                path="admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/complaints"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminComplaints />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/complaints/:id"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminComplaintDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/departments"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageDepartments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/heatmap"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Heatmap />
                  </ProtectedRoute>
                }
              />

              {/* Staff routes */}
              <Route
                path="staff/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['department_staff']}>
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="staff/complaints"
                element={
                  <ProtectedRoute allowedRoles={['department_staff']}>
                    <AssignedComplaints />
                  </ProtectedRoute>
                }
              />
              <Route
                path="staff/complaints/:id"
                element={
                  <ProtectedRoute allowedRoles={['department_staff']}>
                    <StaffComplaintDetails />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;




