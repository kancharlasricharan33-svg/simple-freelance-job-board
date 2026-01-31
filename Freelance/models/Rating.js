const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job is required'],
    unique: true,
    index: true
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
    required: [true, 'Freelancer is required'],
    index: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  feedback: {
    type: String,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters']
  },
  // Additional detailed ratings
  quality: {
    type: Number,
    min: 1,
    max: 5
  },
  communication: {
    type: Number,
    min: 1,
    max: 5
  },
  professionalism: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Indexes for performance
ratingSchema.index({ freelancer: 1, createdAt: -1 });
ratingSchema.index({ client: 1, createdAt: -1 });
ratingSchema.index({ 'rating': -1 });

// Calculate average rating for freelancer
ratingSchema.statics.calculateAverageRating = async function(freelancerId) {
  const stats = await this.aggregate([
    {
      $match: { freelancer: freelancerId }
    },
    {
      $group: {
        _id: '$freelancer',
        average: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('User').findByIdAndUpdate(freelancerId, {
      'rating.average': stats[0].average,
      'rating.count': stats[0].count
    });
  } else {
    await mongoose.model('User').findByIdAndUpdate(freelancerId, {
      'rating.average': 0,
      'rating.count': 0
    });
  }
};

module.exports = mongoose.model('Rating', ratingSchema);