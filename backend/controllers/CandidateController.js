const CandidateProfile = require('../models/CandidateProfile');
const Application = require('../models/Application');
const Job = require('../models/Job');

// @desc    Create or update candidate profile
// @route   PUT /api/candidate/profile
// @access  Private (Candidate)
exports.upsertProfile = async (req, res, next) => {
  try {
    const profileData = { ...req.body, user: req.user._id };

    let profile = await CandidateProfile.findOne({ user: req.user._id });
    if (profile) {
      profile = await CandidateProfile.findOneAndUpdate(
        { user: req.user._id },
        { $set: profileData },
        { new: true, runValidators: true }
      ).populate('user', 'name email avatar');
    } else {
      profile = await CandidateProfile.create(profileData);
      profile = await profile.populate('user', 'name email avatar');
    }

    res.json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Get candidate profile
// @route   GET /api/candidate/profile
// @access  Private (Candidate)
exports.getMyProfile = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ user: req.user._id }).populate(
      'user',
      'name email avatar'
    );
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found. Please create one.' });
    }
    res.json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Apply to a job
// @route   POST /api/candidate/apply/:jobId
// @access  Private (Candidate)
exports.applyJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job || !job.isActive) {
      return res.status(404).json({ success: false, message: 'Job not found or no longer active' });
    }

    const alreadyApplied = await Application.findOne({
      job: req.params.jobId,
      candidate: req.user._id,
    });
    
    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: 'You already applied for this job' });
    }

    const { coverLetter, resume } = req.body;
    const application = await Application.create({
      job: req.params.jobId,
      candidate: req.user._id,
      coverLetter,
      resume,
    });

    // Increment applicant count
    await Job.findByIdAndUpdate(req.params.jobId, { $inc: { applicantsCount: 1 } });

    res.status(201).json({ success: true, message: 'Application submitted successfully!', application });
  } catch (err) {
    next(err);
  }
};

// @desc    Get candidate's applications
// @route   GET /api/candidate/applications
// @access  Private (Candidate)
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate('job', 'title company location type salaryMin salaryMax isActive')
      .sort('-createdAt');
    res.json({ success: true, count: applications.length, applications });
  } catch (err) {
    next(err);
  }
};

// @desc    Get candidate dashboard stats
// @route   GET /api/candidate/dashboard
// @access  Private (Candidate)
exports.getDashboard = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidate: req.user._id });
    const stats = {
      total: applications.length,
      pending: applications.filter((a) => a.status === 'Pending').length,
      reviewed: applications.filter((a) => a.status === 'Reviewed').length,
      shortlisted: applications.filter((a) => a.status === 'Shortlisted').length,
      rejected: applications.filter((a) => a.status === 'Rejected').length,
      hired: applications.filter((a) => a.status === 'Hired').length,
    };
    const profile = await CandidateProfile.findOne({ user: req.user._id });
    res.json({ success: true, stats, profileComplete: !!profile });
  } catch (err) {
    next(err);
  }
};