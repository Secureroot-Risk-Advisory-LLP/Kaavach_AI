import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  title: String,
  description: String,
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: String,
  type: { type: String, enum: ['full-time','part-time','contract','freelance'], default: 'full-time' },
  applyUrl: String,
  tags: [String],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Job', JobSchema);
