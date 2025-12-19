const StatusBadge = ({ status }) => {
  const statusConfig = {
    submitted: { label: 'Submitted', className: 'bg-blue-100 text-blue-800 border border-blue-300' },
    reviewed: { label: 'Reviewed', className: 'bg-cyan-100 text-cyan-800 border border-cyan-300' },
    assigned: { label: 'Assigned', className: 'bg-amber-100 text-amber-800 border border-amber-300' },
    in_progress: { label: 'In Progress', className: 'bg-yellow-100 text-yellow-800 border border-yellow-300' },
    resolved: { label: 'Resolved', className: 'bg-emerald-100 text-emerald-800 border border-emerald-300' },
    closed: { label: 'Closed', className: 'bg-green-100 text-green-800 border border-green-300' }
  };

  const config = statusConfig[status] || statusConfig.submitted;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;





