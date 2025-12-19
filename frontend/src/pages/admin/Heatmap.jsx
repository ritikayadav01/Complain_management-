import { useEffect, useState } from 'react';
import { complaintAPI } from '../../services/api';
import Loading from '../../components/Loading';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import { Icon, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

// Priority-based color configuration
const priorityColors = {
  high: '#ef4444',     // red-500
  medium: '#f97316',   // orange-500
  low: '#22c55e'       // green-500
};

// Status-based color configuration
const statusColors = {
  submitted: '#6b7280',     // gray-500
  reviewed: '#3b82f6',      // blue-500
  assigned: '#8b5cf6',      // violet-500
  in_progress: '#f59e0b',   // amber-500
  resolved: '#10b981',      // emerald-500
  closed: '#6b7280'         // gray-500
};

// Create custom icon based on priority
const createCustomIcon = (priority, status) => {
  const color = priorityColors[priority] || priorityColors.medium;
  const statusColor = statusColors[status] || statusColors.submitted;
  
  return new DivIcon({
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 24px;
          height: 24px;
          background-color: ${color};
          border: 3px solid ${statusColor};
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          position: relative;
        "></div>
        <div style="
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          background-color: white;
          border: 2px solid ${statusColor};
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: 'custom-complaint-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const Heatmap = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [center] = useState([28.6139, 77.2090]); // Default to Delhi
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [map, setMap] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintAPI.getByLocation({});
      
      if (response.data?.complaints) {
        // Filter out complaints without valid coordinates
        const validComplaints = response.data.complaints.filter(
          c => c.location?.coordinates && 
               c.location.coordinates[0] !== 0 && 
               c.location.coordinates[1] !== 0
        );
        
        console.log('Valid complaints with locations:', validComplaints);
        setComplaints(validComplaints);
        
        // Auto-fit map to show all markers
        if (validComplaints.length > 0 && map) {
          const bounds = L.latLngBounds(
            validComplaints.map(c => [
              c.location.coordinates[1], 
              c.location.coordinates[0]
            ])
          );
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter complaints based on selected filters
  const filteredComplaints = complaints.filter(complaint => {
    const priorityMatch = selectedPriority === 'all' || complaint.priority === selectedPriority;
    const statusMatch = selectedStatus === 'all' || complaint.status === selectedStatus;
    return priorityMatch && statusMatch;
  });

  // Format status for display
  const formatStatus = (status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Format category for display
  const formatCategory = (category) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="page-heading">Complaints Heatmap</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {filteredComplaints.length} of {complaints.length} complaint{complaints.length !== 1 ? 's' : ''} shown
          </span>
          <button
            onClick={fetchComplaints}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Priority
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="reviewed">Reviewed</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Priority (Inner Circle)</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: priorityColors.high }}></div>
                <span className="text-xs">High Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: priorityColors.medium }}></div>
                <span className="text-xs">Medium Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: priorityColors.low }}></div>
                <span className="text-xs">Low Priority</span>
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Status (Outer Ring)</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: statusColors.submitted }}></div>
                <span className="text-xs">Submitted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: statusColors.in_progress }}></div>
                <span className="text-xs">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: statusColors.resolved }}></div>
                <span className="text-xs">Resolved</span>
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Instructions</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Click markers for details</li>
              <li>• Hover for quick info</li>
              <li>• Use filters to narrow down</li>
              <li>• Map auto-fits to markers</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="card p-0 overflow-hidden" style={{ height: '600px' }}>
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          whenCreated={setMap}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {filteredComplaints.map((complaint) => (
            <Marker
              key={complaint._id}
              position={[
                complaint.location.coordinates[1], 
                complaint.location.coordinates[0]
              ]}
              icon={createCustomIcon(complaint.priority, complaint.status)}
            >
              {/* Tooltip on hover */}
              <Tooltip permanent={false} direction="top">
                <div className="text-center">
                  <div className="font-semibold text-sm">{complaint.title}</div>
                  <div className="text-xs text-gray-600">
                    {formatCategory(complaint.category)} • {formatStatus(complaint.status)}
                  </div>
                </div>
              </Tooltip>
              
              {/* Detailed popup on click */}
              <Popup maxWidth={300}>
                <div className="w-64 space-y-3">
                  {/* Header */}
                  <div>
                    <h3 className="font-bold text-base mb-1">{complaint.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: priorityColors[complaint.priority] }}
                      >
                        {complaint.priority.toUpperCase()}
                      </span>
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: statusColors[complaint.status] }}
                      >
                        {formatStatus(complaint.status)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-semibold text-gray-700">Category:</span>
                      <span className="text-xs text-gray-600 ml-2">
                        {formatCategory(complaint.category)}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-xs font-semibold text-gray-700">Status:</span>
                      <span className="text-xs text-gray-600 ml-2">
                        {formatStatus(complaint.status)}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-xs font-semibold text-gray-700">Priority:</span>
                      <span className="text-xs text-gray-600 ml-2 capitalize">
                        {complaint.priority}
                      </span>
                    </div>
                    
                    {complaint.location?.address && (
                      <div>
                        <span className="text-xs font-semibold text-gray-700">Address:</span>
                        <p className="text-xs text-gray-600 mt-1">
                          {complaint.location.address}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-xs font-semibold text-gray-700">Reported:</span>
                      <span className="text-xs text-gray-600 ml-2">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-xs font-semibold text-gray-700">Coordinates:</span>
                      <p className="text-xs text-gray-600 mt-1">
                        {complaint.location.coordinates[1].toFixed(6)}, {complaint.location.coordinates[0].toFixed(6)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action button */}
                  <div className="pt-2 border-t">
                    <button
                      onClick={() => window.open(`/admin/complaints/${complaint._id}`, '_blank')}
                      className="w-full px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {complaints.length === 0 && !loading && (
        <div className="card p-6 text-center">
          <p className="text-gray-500">No complaints with location data found.</p>
        </div>
      )}
      
      {complaints.length > 0 && filteredComplaints.length === 0 && (
        <div className="card p-6 text-center">
          <p className="text-gray-500">No complaints match the selected filters.</p>
          <button
            onClick={() => {
              setSelectedPriority('all');
              setSelectedStatus('all');
            }}
            className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Heatmap;




