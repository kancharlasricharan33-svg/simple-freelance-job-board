const Job = require('../models/Job');
const Bid = require('../models/Bid');
const Notification = require('../models/Notification');

// @desc    Get all jobs
// @route   GET /api/v1/jobs
// @access  Public
exports.getJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, status, minBudget, maxBudget, search } = req.query;

    // Build query
    let query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (minBudget || maxBudget) {
      query['budget.max'] = {};
      if (minBudget) query['budget.max'].$gte = Number(minBudget);
      if (maxBudget) query['budget.max'].$lte = Number(maxBudget);
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Pagination
    const pageNumber = parseInt(page);
    const limitNumber = Math.min(parseInt(limit), 50); // Max 50 items per page
    const skip = (pageNumber - 1) * limitNumber;

    // Execute query
    const jobs = await Job.find(query)
      .populate('client', 'name rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean();

    // Get total count
    const totalJobs = await Job.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(totalJobs / limitNumber);
    const hasNext = pageNumber < totalPages;
    const hasPrev = pageNumber > 1;

    res.status(200).json({
      success: true,
      data: {
        jobs,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalJobs,
          hasNext,
          hasPrev
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job
// @route   GET /api/v1/jobs/:id
// @access  Public
exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('client', 'name email rating')
      .populate('freelancer', 'name rating')
      .populate({
        path: 'bids',
        populate: {
          path: 'freelancer',
          select: 'name rating'
        }
      });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { job }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new job
// @route   POST /api/v1/jobs
// @access  Private (Client only)
exports.createJob = async (req, res, next) => {
  try {
    // Add client to request body
    req.body.client = req.user.id;

    const job = await Job.create(req.body);

    // Populate client info
    await job.populate('client', 'name email');

    res.status(201).json({
      success: true,
      data: { job },
      message: 'Job created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job
// @route   PUT /api/v1/jobs/:id
// @access  Private (Job owner only)
exports.updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is job owner
    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    // Prevent updating if job is in progress or completed
    if (job.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update job that is not open'
      });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('client', 'name email');

    res.status(200).json({
      success: true,
      data: { job },
      message: 'Job updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job
// @route   DELETE /api/v1/jobs/:id
// @access  Private (Job owner only)
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is job owner
    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    // Prevent deleting if job has bids or is in progress
    if (job.bids.length > 0 || job.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete job with bids or in progress'
      });
    }

    await job.remove();

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Claim job directly
// @route   POST /api/v1/jobs/:id/claim
// @access  Private (Freelancer only)
exports.claimJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is freelancer
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({
        success: false,
        message: 'Only freelancers can claim jobs'
      });
    }

    // Check if job is open
    if (job.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Job is not available for claiming'
      });
    }

    // Check if already claimed
    if (job.freelancer) {
      return res.status(400).json({
        success: false,
        message: 'Job already claimed'
      });
    }

    // Update job
    job.freelancer = req.user.id;
    job.status = 'in_progress';
    await job.save();

    // Create notification for client
    await Notification.create({
      user: job.client,
      type: 'job_completed',
      title: 'Job Claimed',
      message: `${req.user.name} has claimed your job: ${job.title}`,
      relatedJob: job._id
    });

    res.status(200).json({
      success: true,
      data: { job },
      message: 'Job claimed successfully'
    });
  } catch (error) {
    next(error);
  }
};