import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },

  // ✅ CLOUDINARY ATTACHMENTS
  attachments: [
    {
      url: {
        type: String,
        required: true
      },
      publicId: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['image', 'video'],
        required: true
      }
    }
  ],

  readBy: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      readAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, {
  timestamps: true
});

// Indexes
chatSchema.index({ complaintId: 1, createdAt: -1 });
chatSchema.index({ senderId: 1 });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
