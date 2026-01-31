const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job is required'],
    index: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Freelancer is required'],
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Bid amount is required'],
    min: [0, 'Bid amount cannot be negative']
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    enum: ['less than 1 week', '1-2 weeks', '2-4 weeks', '1-3 months', '3+ months']
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
    index: true
  }
}, {
  timestamps: true
});

// Indexes for performance
bidSchema.index({ job: 1, createdAt: -1 });
bidSchema.index({ freelancer: 1, status: 1 });
bidSchema.index({ job: 1, amount: 1 });

// Ensure freelancer can only bid once per job
bidSchema.index({ job: 1, freelancer: 1 }, { unique: true });

module.exports = mongoose.model('Bid', bidSchema);