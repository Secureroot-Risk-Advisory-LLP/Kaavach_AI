import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: true
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'triaged', 'duplicate'],
    default: 'pending'
  },
  reward: {
    type: Number,
    default: 0
  },
  rewardGiven: {
    type: Boolean,
    default: false
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: {
    type: String,
    default: ''
  },
  // AI generated fields
  aiSummary: {
    type: String,
    default: ''
  },
  aiSeverityScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Report', reportSchema);

