import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { complaintAPI, chatAPI } from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import Loading from '../../components/Loading';
import { format } from 'date-fns';
import { FiSend, FiStar, FiCheck } from 'react-icons/fi';
import { MdDoneAll } from 'react-icons/md';

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket, joinComplaint, leaveComplaint } = useSocket();
  const { user: currentUser } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ rating: 0, comment: '' });

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

      const handleStatusUpdated = (data) => {
        if (data.complaintId === id) {
          console.log('📊 Complaint status updated');
          fetchComplaint();
        }
      };

      socket.on('complaint_status_updated', handleStatusUpdated);

      return () => {
        socket.off('message_received', handleMessageReceived);
        socket.off('new_message', handleMessageReceived);
        socket.off('complaint_status_updated', handleStatusUpdated);
        leaveComplaint(id);
      };
    }
  }, [id, socket]);

  const fetchComplaint = async () => {
    try {
      const response = await complaintAPI.getById(id);
      setComplaint(response.data.complaint);
      if (response.data.complaint.feedback) {
        setFeedback(response.data.complaint.feedback);
      }
    } catch (error) {
      toast.error('Failed to load complaint');
      navigate('/complaints');
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

  const submitFeedback = async () => {
    if (feedback.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await complaintAPI.submitFeedback(id, feedback);
      toast.success('Feedback submitted');
      fetchComplaint();
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  if (loading) return <Loading />;
  if (!complaint) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/complaints')}
          className="text-primary-600 hover:text-primary-700"
        >
          ← Back to Complaints
        </button>
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
        </div>

        {/* Sidebar: Chat + Details + Feedback */}
        <div className="space-y-6">
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

          <div className="card">
            <h3 className="section-heading">Details</h3>
            <div className="space-y-3 text-sm">
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

          {/* Feedback */}
          {complaint.status === 'resolved' && !complaint.feedback && (
            <div className="card">
              <h3 className="section-heading">Rate Your Experience</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedback({ ...feedback, rating: star })}
                        className={`p-2 rounded ${
                          star <= feedback.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        <FiStar className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Comment</label>
                  <textarea
                    value={feedback.comment}
                    onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                    className="input"
                    rows="3"
                    placeholder="Share your feedback..."
                  />
                </div>
                <button onClick={submitFeedback} className="btn btn-primary w-full">
                  Submit Feedback
                </button>
              </div>
            </div>
          )}

          {complaint.feedback && (
            <div className="card">
              <h3 className="section-heading">Your Feedback</h3>
              <div className="flex items-center gap-2 mb-2">
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
              </div>
              {complaint.feedback.comment && (
                <p className="text-sm text-gray-700">{complaint.feedback.comment}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;





