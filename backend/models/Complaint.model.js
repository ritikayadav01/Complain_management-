import mongoose from 'mongoose';

const timelineSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ['submitted', 'reviewed', 'assigned', 'in_progress', 'resolved', 'closed']
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Complaint title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Complaint description is required'],
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'infrastructure',
      'sanitation',
      'water_supply',
      'electricity',
      'traffic',
      'waste_management',
      'parks',
      'security',
      'other'
    ]
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['submitted', 'reviewed', 'assigned', 'in_progress', 'resolved', 'closed'],
    default: 'submitted'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  assignedStaff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: {
      type: String,
      trim: true
    }
  },
  attachments: [{
    filename: String,
    publicId: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number
  }],
  timeline: [timelineSchema],
  aiCategory: {
    type: String,
    default: null
  },
  aiPriority: {
    type: String,
    default: null
  },
  aiAssignedDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  resolutionSummary: {
    type: String,
    trim: true
  },
  resolutionImages: [{
    filename: String,
    publicId: String,
    originalName: String,
    path: String,
    mimetype: String
  }],
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    },
    submittedAt: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Geospatial index for location queries
complaintSchema.index({ location: '2dsphere' });

// Indexes for faster queries
complaintSchema.index({ userId: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ assignedDepartment: 1 });
complaintSchema.index({ assignedStaff: 1 });
complaintSchema.index({ createdAt: -1 });

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;




