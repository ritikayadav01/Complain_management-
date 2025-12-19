import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { complaintAPI, departmentAPI, userAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FiArrowLeft, FiStar } from 'react-icons/fi';

const AdminComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');

  const getFileUrl = (file) => {
    const raw = file?.path || file?.url || '';
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw;
    const base = api.defaults.baseURL.replace(/\/api\/?$/, '');
    return `${base}/${String(raw).replace(/^[/\\]+/, '').replace(/\\/g, '/')}`;
  };

  useEffect(() => {
    fetchComplaint();
    fetchDepartments();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const response = await complaintAPI.getById(id);
      setComplaint(response.data.complaint);
    } catch (error) {
      toast.error('Failed to load complaint');
      navigate('/admin/complaints');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll({ limit: 100 });
      setDepartments(response.data.departments || []);
    } catch (error) {
      toast.error('Failed to load departments');
    }
  };

  const handleDepartmentSelect = async (deptId) => {
    setSelectedDepartment(deptId);
    setStaffMembers([]);
    setSelectedStaff('');
    
    if (deptId) {
      try {
        const response = await userAPI.getAll({ 
          department: deptId, 
          role: 'department_staff',
          limit: 100
        });
        setStaffMembers(response.data.users || []);
        if (!response.data.users || response.data.users.length === 0) {
          toast('No staff members found for this department', { icon: 'ℹ️' });
        }
      } catch (error) {
        console.error('Failed to load staff members:', error);
        toast.error('Failed to load staff members');
        setStaffMembers([]);
      }
    }
  };

  const assignComplaint = async () => {
    if (!selectedDepartment) {
      toast.error('Please select a department');
      return;
    }

    try {
      const assignData = {
        departmentId: selectedDepartment
      };
      if (selectedStaff) {
        assignData.staffId = selectedStaff;
      }

      await complaintAPI.assign(id, assignData);
      toast.success('Complaint assigned successfully');
      setAssignModalOpen(false);
      setSelectedDepartment('');
      setSelectedStaff('');
      fetchComplaint();
    } catch (error) {
      console.error('Assignment error:', error);
      toast.error(error.response?.data?.message || 'Failed to assign complaint');
    }
  };

  if (loading) return <Loading />;
  if (!complaint) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/complaints')}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
        >
          <FiArrowLeft className="w-5 h-5" />
          Back to Complaints
        </button>
        {!complaint.assignedStaff && complaint.status !== 'resolved' && (
          <button
            onClick={() => setAssignModalOpen(true)}
            className="btn btn-primary"
          >
            Assign to Staff
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="page-heading">{complaint.title}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <StatusBadge status={complaint.status} />
                  <PriorityBadge priority={complaint.priority} />
                </div>
              </div>
            </div>

            <div className="prose max-w-none mb-6">
              <h3 className="section-heading">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
            </div>

            {complaint.attachments?.length > 0 && (
              <div>
                <h3 className="section-heading">Attachments</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {complaint.attachments.map((file, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      {file.mimetype?.startsWith('image/') ? (
                        <img
                          src={getFileUrl(file)}
                          alt={file.originalName}
                          className="w-full h-32 object-cover"
                        />
                      ) : file.mimetype?.startsWith('video/') ? (
                        <video
                          src={getFileUrl(file)}
                          className="w-full h-32 object-cover"
                          controls
                        />
                      ) : (
                        <a
                          className="w-full h-32 bg-gray-100 flex items-center justify-center"
                          href={getFileUrl(file)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <span className="text-sm text-gray-600">{file.originalName}</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {complaint.resolutionImages?.length > 0 && (
              <div className="mt-6">
                <h3 className="section-heading">Resolution Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {complaint.resolutionImages.map((file, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      {file.mimetype?.startsWith('image/') ? (
                        <img
                          src={getFileUrl(file)}
                          alt={file.originalName || 'Resolution file'}
                          className="w-full h-32 object-cover"
                        />
                      ) : file.mimetype?.startsWith('video/') ? (
                        <video
                          src={getFileUrl(file)}
                          className="w-full h-32 object-cover"
                          controls
                        />
                      ) : (
                        <a
                          className="w-full h-32 bg-gray-100 flex items-center justify-center"
                          href={getFileUrl(file)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <span className="text-sm text-gray-600">{file.originalName || 'Resolution file'}</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="mt-6">
              <h3 className="section-heading">Timeline</h3>
              <div className="space-y-3">
                {complaint.timeline?.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary-600 mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium capitalize">{item.status.replace('_', ' ')}</p>
                      <p className="text-xs text-gray-600">{item.comment}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(item.timestamp), 'PPp')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="section-heading">Complaint Details</h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-gray-600">Complaint ID:</span>
                <span className="block font-mono text-xs text-gray-800 mt-1">{complaint._id}</span>
              </div>
              <div>
                <span className="text-gray-600">Category:</span>
                <span className="ml-2 font-medium capitalize">
                  {complaint.category?.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Priority:</span>
                <span className="ml-2">
                  <PriorityBadge priority={complaint.priority} />
                </span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="ml-2">
                  <StatusBadge status={complaint.status} />
                </span>
              </div>
              <div>
                <span className="text-gray-600">Submitted:</span>
                <span className="ml-2 font-medium">
                  {format(new Date(complaint.createdAt), 'PPp')}
                </span>
              </div>
              <div>
                <span className="text-gray-600">User:</span>
                <span className="ml-2 font-medium">{complaint.userId?.name}</span>
              </div>
              <div>
                <span className="text-gray-600">User Email:</span>
                <span className="ml-2 font-medium">{complaint.userId?.email}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="section-heading">Assignment</h3>
            {complaint.assignedDepartment ? (
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Department:</span>
                  <span className="ml-2 font-medium">{complaint.assignedDepartment.name}</span>
                </div>
                {complaint.assignedStaff && (
                  <div>
                    <span className="text-gray-600">Staff Member:</span>
                    <span className="ml-2 font-medium">{complaint.assignedStaff.name}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">Not assigned yet</p>
            )}
          </div>


          {complaint.feedback && (
            <div className="card">
              <h3 className="section-heading">User Feedback</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        className={`w-5 h-5 ${
                          star <= complaint.feedback.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {complaint.feedback.rating}/5
                    </span>
                  </div>
                </div>
                {complaint.feedback.comment && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Comment:</p>
                    <p className="text-sm text-gray-700 italic">"{complaint.feedback.comment}"</p>
                  </div>
                )}
                {complaint.feedback.submittedAt && (
                  <div>
                    <span className="text-xs text-gray-500">
                      Submitted: {format(new Date(complaint.feedback.submittedAt), 'PPp')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assign Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setSelectedDepartment('');
          setSelectedStaff('');
        }}
        title="Assign Complaint"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => handleDepartmentSelect(e.target.value)}
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

          {selectedDepartment && staffMembers.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Staff Member (Optional)</label>
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="input"
              >
                <option value="">Assign to Department (any staff)</option>
                {staffMembers.map((staff) => (
                  <option key={staff._id} value={staff._id}>
                    {staff.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-4">
            <button onClick={assignComplaint} className="btn btn-primary flex-1">
              Assign
            </button>
            <button
              onClick={() => {
                setAssignModalOpen(false);
                setSelectedDepartment('');
                setSelectedStaff('');
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

export default AdminComplaintDetails;
