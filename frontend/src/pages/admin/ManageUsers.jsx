import { useEffect, useState } from 'react';
import { userAPI, departmentAPI, authAPI } from '../../services/api';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit } from 'react-icons/fi';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDepartmentForStaff, setSelectedDepartmentForStaff] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    isActive: ''
  });
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'user',
    department: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAll({ 
        ...filters,
        limit: 100 
      });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll({ limit: 100 });
      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error('Failed to load departments');
    }
  };

  const handleAssignDepartment = async () => {
    if (!selectedUser) {
      toast.error('No user selected');
      return;
    }

    try {
      if (selectedDepartmentForStaff && (!selectedUser.department || selectedUser.department._id !== selectedDepartmentForStaff)) {
        // Remove from old department if exists
        if (selectedUser.department?._id) {
          try {
            await departmentAPI.removeStaff(selectedUser.department._id, {
              staffId: selectedUser._id
            });
          } catch (err) {
            console.error('Failed to remove from old department:', err);
          }
        }
        // Add to new department
        await departmentAPI.addStaff(selectedDepartmentForStaff, {
          staffId: selectedUser._id
        });
        toast.success('Staff assigned to department');
      } else if (!selectedDepartmentForStaff && selectedUser.department?._id) {
        // Remove from department
        await departmentAPI.removeStaff(selectedUser.department._id, {
          staffId: selectedUser._id
        });
        toast.success('Staff removed from department');
      }
      setAssignModalOpen(false);
      setSelectedUser(null);
      setSelectedDepartmentForStaff('');
      fetchUsers();
    } catch (error) {
      console.error('Assignment error:', error);
      toast.error(error.response?.data?.message || 'Failed to assign staff member');
    }
  };

  const createNewUser = async () => {
    // Validation
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Name, email, and password are required');
      return;
    }

    if (newUser.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (newUser.role === 'department_staff' && !newUser.department) {
      toast.error('Please select a department for staff members');
      return;
    }

    try {
      const userData = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        phone: newUser.phone,
        address: newUser.address,
        role: newUser.role
      };

      // Create user via register endpoint
      const response = await authAPI.register(userData);
      
      // If department staff, add to department
      if (newUser.role === 'department_staff' && newUser.department) {
        try {
          await departmentAPI.addStaff(newUser.department, {
            staffId: response.data.user.id
          });
          console.log('Staff added to department successfully');
        } catch (deptError) {
          console.error('Failed to add staff to department:', deptError);
          toast.error('User created but failed to assign to department');
        }
      }

      toast.success(`${newUser.role === 'user' ? 'User' : 'Staff'} account created successfully`);
      setCreateModalOpen(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        role: 'user',
        department: ''
      });
      fetchUsers();
    } catch (error) {
      console.error('Create user error:', error);
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-heading">Manage Users</h1>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          Create New User
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="input"
            >
              <option value="">All</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="department_staff">Department Staff</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filters.isActive}
              onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
              className="input"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Department</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3 capitalize">{user.role?.replace('_', ' ')}</td>
                  <td className="p-3">{user.department?.name || 'N/A'}</td>
                  <td className="p-3">
                    <span
                      className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {user.role === 'department_staff' && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setSelectedDepartmentForStaff(user.department?._id || '');
                            setAssignModalOpen(true);
                          }}
                          className="text-primary-600 hover:text-primary-700"
                          title="Assign to Department"
                        >
                          <FiEdit className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setNewUser({
            name: '',
            email: '',
            password: '',
            phone: '',
            address: '',
            role: 'user',
            department: ''
          });
        }}
        title="Create New User"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="input"
            >
              <option value="user">Regular User (Citizen)</option>
              <option value="department_staff">Department Staff Member</option>
            </select>
            <p className="text-xs text-gray-600 mt-1">
              {newUser.role === 'user' && 'Can file complaints and chat with staff'}
              {newUser.role === 'department_staff' && 'Can handle assigned complaints and chat with users'}
            </p>
            <p className="text-xs text-amber-600 mt-2 font-medium">
              ⚠️ Note: Administrator accounts are created automatically via environment variables on server start and cannot be created through this interface.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Full Name *</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="input"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="input"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password *</label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="input"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              type="tel"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              className="input"
              placeholder="+1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <textarea
              value={newUser.address}
              onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
              className="input"
              rows="2"
              placeholder="Street address"
            />
          </div>

          {newUser.role === 'department_staff' && (
            <div>
              <label className="block text-sm font-medium mb-2">Department *</label>
              <select
                value={newUser.department}
                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                className="input"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button onClick={createNewUser} className="btn btn-primary flex-1">
              Create Account
            </button>
            <button
              onClick={() => {
                setCreateModalOpen(false);
                setNewUser({
                  name: '',
                  email: '',
                  password: '',
                  phone: '',
                  address: '',
                  role: 'user',
                  department: ''
                });
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Assign Department Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setSelectedUser(null);
          setSelectedDepartmentForStaff('');
        }}
        title={`Assign Department: ${selectedUser?.name}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Department</label>
            <select
              value={selectedDepartmentForStaff}
              onChange={(e) => setSelectedDepartmentForStaff(e.target.value)}
              className="input"
            >
              <option value="">No Department (Unassign)</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <button onClick={handleAssignDepartment} className="btn btn-primary flex-1">
              Save Assignment
            </button>
            <button
              onClick={() => {
                setAssignModalOpen(false);
                setSelectedUser(null);
                setSelectedDepartmentForStaff('');
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageUsers;



