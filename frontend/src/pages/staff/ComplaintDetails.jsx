import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { complaintAPI, chatAPI } from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';
import { format } from 'date-fns';
import { FiSend, FiUpload, FiCheck } from 'react-icons/fi';
import { MdDoneAll } from 'react-icons/md';

const StaffComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket, joinComplaint, leaveComplaint } = useSocket();
  const { user: currentUser } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolutionData, setResolutionData] = useState({
    resolutionDetails: '',
    images: []
  });
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusData, setStatusData] = useState({ status: '', comment: '' });

  const getFileUrl = (file) => {
    const raw = file?.path || file?.url || '';
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw;
    const base = api.defaults.baseURL.replace(/\/api\/?$/, '');
    return `${base}/${String(raw).replace(/^[/\\]+/, '').replace(/\\/g, '/')}`;
  };

  useEffect(() => {
    fetchComplaint();
    fetchMessages();
    joinComplaint(id);

    if (socket) {
      const handleMessageReceived = (data) => {
        console.log('💬 message_received event:', data);
        if (data.complaintId === id) {
          console.log('💬 Adding received message to state');
          // Check if message already exists to avoid duplicates
          setMessages((prev) => {
            const messageExists = prev.some(msg => msg._id === data.message._id);
            if (!messageExists) {
              return [...prev, data.message];
            }
            return prev;
          });
        }
      };

      socket.on('message_received', handleMessageReceived);
      socket.on('new_message', handleMessageReceived); // Also listen for new_message in case

      return () => {
        socket.off('message_received', handleMessageReceived);
        socket.off('new_message', handleMessageReceived);
        leaveComplaint(id);
      };
    }

    return () => {
      leaveComplaint(id);
    };
  }, [id, socket]);

  const fetchComplaint = async () => {
    try {
      const response = await complaintAPI.getById(id);
      setComplaint(response.data.complaint);
    } catch (error) {
      toast.error('Failed to load complaint');
      navigate('/staff/complaints');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await chatAPI.getMessages(id);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to load messages');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      console.log('💬 Sending message:', messageText);
      const response = await chatAPI.sendMessage(id, { message: messageText });
      console.log('💬 Message sent response:', response);
      
      // Add the sent message immediately to the UI only if it's not already there
      if (response.data?.chatMessage) {
        console.log('💬 Adding message to state:', response.data.chatMessage);
        setMessages((prev) => {
          const messageExists = prev.some(msg => msg._id === response.data.chatMessage._id);
          if (!messageExists) {
            return [...prev, response.data.chatMessage];
          }
          return prev;
        });
      }
      
      setMessageText('');
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const updateStatus = async () => {
    try {
      await complaintAPI.updateStatus(id, statusData);
      toast.success('Status updated');
      setStatusModalOpen(false);
      setStatusData({ status: '', comment: '' });
      fetchComplaint();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const resolveComplaint = async () => {
    try {
      const formData = new FormData();
      formData.append('resolutionDetails', resolutionData.resolutionDetails);
      if (resolutionData.images.length > 0) {
        resolutionData.images.forEach(file => {
          formData.append('images', file);
        });
      }
      await complaintAPI.resolve(id, formData);
      toast.success('Complaint resolved');
      setResolveModalOpen(false);
      setResolutionData({ resolutionDetails: '', images: [] });
      fetchComplaint();
    } catch (error) {
      toast.error('Failed to resolve complaint');
    }
  };

  if (loading) return <Loading />;
  if (!complaint) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/staff/complaints')}
          className="text-primary-600 hover:text-primary-700"
        >
          ← Back to Complaints
        </button>
        {complaint.status !== 'resolved' && complaint.status !== 'closed' && (
          <div className="flex gap-2">
            <button
              onClick={() => setStatusModalOpen(true)}
              className="btn btn-secondary"
            >
              Update Status
            </button>
            <button
              onClick={() => setResolveModalOpen(true)}
              className="btn btn-success"
            >
              Resolve Complaint
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="page-heading">{complaint.title}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <StatusBadge status={complaint.status} />
                  <PriorityBadge priority={complaint.priority} />
                </div>
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
            </div>

            {complaint.attachments?.length > 0 && (
              <div className="mt-6">
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
                      <p className="text-sm font-medium">{item.comment}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(item.timestamp), 'PPp')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="card h-[28rem] flex flex-col">
            <h3 className="section-heading">Chat</h3>
            <div className="space-y-3 flex-1 min-h-0 overflow-y-auto mb-4 bg-blue-50 p-4 rounded-lg">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No messages yet. Start the conversation!</p>
              ) : (
                messages.map((msg) => {
                  const isCurrentUserSender = msg.senderId._id === currentUser?._id;
                  const isMessageRead = msg.readBy?.some(read => read.userId === currentUser?._id);
                  
                  return (
                    <div
                      key={msg._id}
                      className={`flex gap-3 ${isCurrentUserSender ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isCurrentUserSender && (
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {msg.senderId.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className={`flex-1 max-w-xs lg:max-w-sm ${isCurrentUserSender ? 'text-right' : ''}`}>
                        <div className={`inline-block rounded-lg px-4 py-3 ${
                          isCurrentUserSender
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-900 border border-blue-200'
                        }`}>
                          {!isCurrentUserSender && (
                            <p className="text-xs font-semibold text-blue-700 mb-1">
                              {msg.senderId.name}
                            </p>
                          )}
                          <p className="text-sm break-words">{msg.message}</p>
                          <p className={`text-xs mt-1 flex items-center gap-1 justify-end ${
                            isCurrentUserSender ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {format(new Date(msg.createdAt), 'HH:mm')}
                            {isCurrentUserSender && (
                              isMessageRead ? (
                                <MdDoneAll className="w-3 h-3" />
                              ) : (
                                <FiCheck className="w-3 h-3" />
                              )
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2 mt-auto">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="input flex-1"
                placeholder="Type a message..."
              />
              <button type="submit" className="btn btn-primary">
                <FiSend className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="section-heading">Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">User:</span>
                <span className="ml-2 font-medium">{complaint.userId?.name}</span>
              </div>
              <div>
                <span className="text-gray-600">Address:</span>
                <span className="ml-2 font-medium">
                  {complaint.location?.address || 'No address provided'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Category:</span>
                <span className="ml-2 font-medium capitalize">
                  {complaint.category?.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2 font-medium">
                  {format(new Date(complaint.createdAt), 'PPp')}
                </span>
              </div>
              {complaint.assignedDepartment && (
                <div>
                  <span className="text-gray-600">Department:</span>
                  <span className="ml-2 font-medium">
                    {complaint.assignedDepartment.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Status"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={statusData.status}
              onChange={(e) => setStatusData({ ...statusData, status: e.target.value })}
              className="input"
            >
              <option value="">Select status</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Comment</label>
            <textarea
              value={statusData.comment}
              onChange={(e) => setStatusData({ ...statusData, comment: e.target.value })}
              className="input"
              rows="3"
              placeholder="Add a comment..."
            />
          </div>
          <div className="flex gap-4">
            <button onClick={updateStatus} className="btn btn-primary flex-1">
              Update
            </button>
            <button
              onClick={() => setStatusModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Resolve Modal */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Resolve Complaint"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Resolution Details</label>
            <textarea
              required
              value={resolutionData.resolutionDetails}
              onChange={(e) =>
                setResolutionData({ ...resolutionData, resolutionDetails: e.target.value })
              }
              className="input"
              rows="5"
              placeholder="Describe how the complaint was resolved..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Resolution Images</label>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) =>
                setResolutionData({
                  ...resolutionData,
                  images: Array.from(e.target.files)
                })
              }
              className="input"
            />
          </div>
          <div className="flex gap-4">
            <button onClick={resolveComplaint} className="btn btn-success flex-1">
              Mark as Resolved
            </button>
            <button
              onClick={() => setResolveModalOpen(false)}
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

export default StaffComplaintDetails;





