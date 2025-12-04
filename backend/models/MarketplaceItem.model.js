import mongoose from 'mongoose';

const MarketplaceItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, default: 0 },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [String],
  attachments: [String],
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('MarketplaceItem', MarketplaceItemSchema);
