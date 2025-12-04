import mongoose from 'mongoose';

const writeupSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,        // Changed to String so seed strings like "Alice" work
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  tags: [{
    type: String
  }],
}, {
  timestamps: true
});

export default mongoose.model('Writeup', writeupSchema);
