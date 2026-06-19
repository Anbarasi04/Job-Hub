const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get all active jobs (with search & filter)
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res, next) => {
  try {
    const {
      search,
      location,
      type,
      category,
      experienceLevel,
      salaryMin,
      page = 1,
      limit = 10,
    } = req.query;

    const query = { isActive: true };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (location) query.location = { $regex: location, $options: 'i' };
    if (type) query.type = type;
    if (category) query.category = category;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (salaryMin) query.salaryMin = { $gte: Number(salaryMin) };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('recruiter', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: jobs.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      jobs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiter', 'name email');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

// @desc    Create job
// @route   POST /api/jobs
// @access  Private (Recruiter)
exports.createJob = async (req, res, next) => {
  try {
    const job = await Job.create({ ...req.body, recruiter: req.user._id });
    res.status(201).json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter - owner)
exports.updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this job' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter - owner)
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();
    await Application.deleteMany({ job: req.params.id });

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get recruiter's jobs
// @route   GET /api/jobs/recruiter/myjobs
// @access  Private (Recruiter)
exports.getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).sort('-createdAt');
    res.json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    next(err);
  }
};

// @desc    Get applicants for a job
// @route   GET /api/jobs/:id/applicants
// @access  Private (Recruiter - owner)
exports.getApplicants = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const applications = await Application.find({ job: req.params.id })
      .populate('candidate', 'name email avatar')
      .sort('-createdAt');

    res.json({ success: true, count: applications.length, applications });
  } catch (err) {
    next(err);
  }
};

// @desc    Update application status
// @route   PUT /api/jobs/application/:appId/status
// @access  Private (Recruiter)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, recruiterNotes } = req.body;
    const application = await Application.findById(req.params.appId).populate('job');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    application.status = status || application.status;
    application.recruiterNotes = recruiterNotes || application.recruiterNotes;
    await application.save();

    res.json({ success: true, application });
  } catch (err) {
    next(err);
  }
};

// @desc    Recruiter dashboard stats
// @route   GET /api/jobs/recruiter/dashboard
// @access  Private (Recruiter)
exports.getRecruiterDashboard = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id });
    const jobIds = jobs.map((j) => j._id);
    const applications = await Application.find({ job: { $in: jobIds } });

    const stats = {
      totalJobs: jobs.length,
      activeJobs: jobs.filter((j) => j.isActive).length,
      totalApplications: applications.length,
      pending: applications.filter((a) => a.status === 'Pending').length,
      shortlisted: applications.filter((a) => a.status === 'Shortlisted').length,
      hired: applications.filter((a) => a.status === 'Hired').length,
    };

    const recentJobs = jobs.slice(0, 5);
    res.json({ success: true, stats, recentJobs });
  } catch (err) {
    next(err);
  }
};