import mongoose from 'mongoose';

const BreachAlertSchema = new mongoose.Schema({
  title: String,
  description: String,
  severity: { type: String, enum: ['low','medium','high','critical'], default: 'medium' },
  discoveredAt: Date,
  affectedAssets: [String],
  references: [String],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('BreachAlert', BreachAlertSchema);
