const PriorityBadge = ({ priority }) => {
  const priorityConfig = {
    low: { label: 'Low', className: 'bg-blue-100 text-blue-800 border border-blue-300' },
    medium: { label: 'Medium', className: 'bg-orange-100 text-orange-800 border border-orange-300' },
    high: { label: 'High', className: 'bg-red-100 text-red-800 border border-red-300' }
  };

  const config = priorityConfig[priority] || priorityConfig.medium;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
};

export default PriorityBadge;





