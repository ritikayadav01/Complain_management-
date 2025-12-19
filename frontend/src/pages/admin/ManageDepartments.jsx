import { useEffect, useState } from 'react';
import { departmentAPI, userAPI } from '../../services/api';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiUsers } from 'react-icons/fi';

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    contactEmail: '',
    contactPhone: ''
  });
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [currentDept, setCurrentDept] = useState(null);
  const [availableStaff, setAvailableStaff] = useState([]);
  const [deptStaff, setDeptStaff] = useState([]);
  const [selectedStaffToAdd, setSelectedStaffToAdd] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data.departments);
    } catch (error) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await departmentAPI.update(editing._id, formData);
        toast.success('Department updated');
      } else {
        await departmentAPI.create(formData);
        toast.success('Department created');
      }
      setModalOpen(false);
      setEditing(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        contactEmail: '',
        contactPhone: ''
      });
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save department');
    }
  };

  const handleEdit = (dept) => {
    setEditing(dept);
    setFormData({
      name: dept.name,
      description: dept.description || '',
      category: dept.category,
      contactEmail: dept.contactEmail || '',
      contactPhone: dept.contactPhone || ''
    });
    setModalOpen(true);
  };

  const openStaffModal = async (dept) => {
    setCurrentDept(dept);
    setDeptStaff(dept.staff || []);
    setSelectedStaffToAdd('');
    setStaffModalOpen(true);

    try {
      setUsersLoading(true);
      const res = await userAPI.getAll({ role: 'department_staff', limit: 100 });
      const users = res.data.users || [];
      const filtered = users.filter(u => !(dept.staff || []).some(s => s._id === u._id));
      setAvailableStaff(filtered);
    } catch (error) {
      console.error('Failed to load staff list:', error);
      toast.error('Failed to load staff list');
      setAvailableStaff([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleAddStaff = async () => {
    if (!selectedStaffToAdd || !currentDept) return;
    try {
      await departmentAPI.addStaff(currentDept._id, { staffId: selectedStaffToAdd });
      toast.success('Staff added to department');
      await fetchDepartments();
      const res = await userAPI.getAll({ role: 'department_staff', limit: 100 });
      const users = res.data.users || [];
      const updatedDept = departments.find(d => d._id === currentDept._id) || currentDept;
      setDeptStaff(updatedDept.staff || []);
      const filtered = users.filter(u => !(updatedDept.staff || []).some(s => s._id === u._id));
      setAvailableStaff(filtered);
      setSelectedStaffToAdd('');
    } catch (error) {
      console.error('Failed to add staff:', error);
      toast.error(error.response?.data?.message || 'Failed to add staff');
    }
  };

  const handleRemoveStaff = async (staffId) => {
    if (!currentDept) return;
    try {
      await departmentAPI.removeStaff(currentDept._id, { staffId });
      toast.success('Staff removed from department');
      await fetchDepartments();
      const updatedDept = departments.find(d => d._id === currentDept._id) || currentDept;
      setDeptStaff(updatedDept.staff || []);
      const res = await userAPI.getAll({ role: 'department_staff', limit: 100 });
      const users = res.data.users || [];
      const filtered = users.filter(u => !(updatedDept.staff || []).some(s => s._id === u._id));
      setAvailableStaff(filtered);
    } catch (error) {
      console.error('Failed to remove staff:', error);
      toast.error(error.response?.data?.message || 'Failed to remove staff');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-heading">Manage Departments</h1>
        <button
          onClick={() => {
            setEditing(null);
            setFormData({
              name: '',
              description: '',
              category: '',
              contactEmail: '',
              contactPhone: ''
            });
            setModalOpen(true);
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          Add Department
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Staff Count</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{dept.name}</td>
                  <td className="p-3 capitalize">{dept.category?.replace('_', ' ')}</td>
                  <td className="p-3">{dept.staff?.length || 0}</td>
                  <td className="p-3">
                    <span
                      className={`badge ${dept.isActive ? 'badge-success' : 'badge-danger'}`}
                    >
                      {dept.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(dept)}
                        className="text-primary-600 hover:text-primary-700"
                        title="Edit Department"
                      >
                        <FiEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openStaffModal(dept)}
                        className="text-primary-600 hover:text-primary-700"
                        title="Manage Staff"
                      >
                        <FiUsers className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit Department' : 'Add Department'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
            >
              <option value="">Select category</option>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Contact Phone</label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="input"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <button type="submit" className="btn btn-primary flex-1">
              {editing ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
      {/* Manage Staff Modal */}
      <Modal
        isOpen={staffModalOpen}
        onClose={() => {
          setStaffModalOpen(false);
          setCurrentDept(null);
        }}
        title={`Manage Staff ${currentDept ? `- ${currentDept.name}` : ''}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Current Staff</label>
            {deptStaff.length === 0 ? (
              <p className="text-sm text-gray-500">No staff assigned to this department</p>
            ) : (
              <ul className="space-y-2">
                {deptStaff.map((s) => (
                  <li key={s._id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-gray-500">{s.email}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveStaff(s._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Remove staff"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Add Staff</label>
            {usersLoading ? (
              <p className="text-sm text-gray-500">Loading staff...</p>
            ) : (
              <div className="flex gap-2">
                <select
                  value={selectedStaffToAdd}
                  onChange={(e) => setSelectedStaffToAdd(e.target.value)}
                  className="input flex-1"
                >
                  <option value="">Select staff to add</option>
                  {availableStaff.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} — {u.email}
                    </option>
                  ))}
                </select>
                <button onClick={handleAddStaff} className="btn btn-primary">Add</button>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageDepartments;





