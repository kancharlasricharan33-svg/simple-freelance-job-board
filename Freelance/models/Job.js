const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['design', 'writing', 'development', 'marketing', 'data', 'other'],
    index: true
  },
  budget: {
    min: {
      type: Number,
      min: [0, 'Minimum budget cannot be negative']
    },
    max: {
      type: Number,
      min: [0, 'Maximum budget cannot be negative']
    }
  },
  duration: {
    type: String,
    enum: ['less than 1 week', '1-2 weeks', '2-4 weeks', '1-3 months', '3+ months']
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Client is required'],
    index: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'completed', 'cancelled'],
    default: 'open',
    index: true
  },
  bids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  }],
  skillsRequired: [{
    type: String,
    trim: true
  }],
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for performance
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ category: 1, status: 1 });
jobSchema.index({ client: 1, status: 1 });
jobSchema.index({ 'budget.max': 1 });
jobSchema.index({ title: 'text', description: 'text', skillsRequired: 'text' });

// Virtual for bid count
jobSchema.virtual('bidCount').get(function() {
  return this.bids.length;
});

// Ensure text index is created
jobSchema.statics.createTextIndex = function() {
  return this.collection.createIndex({
    title: 'text',
    description: 'text',
    skillsRequired: 'text'
  });
};

module.exports = mongoose.model('Job', jobSchema);