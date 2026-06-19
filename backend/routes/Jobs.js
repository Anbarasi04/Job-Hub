const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  getApplicants,
  updateApplicationStatus,
  getRecruiterDashboard,
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getJobs);
router.get('/:id', getJob);

// Recruiter routes
router.use(protect);
router.get('/recruiter/myjobs', authorize('recruiter'), getMyJobs);
router.get('/recruiter/dashboard', authorize('recruiter'), getRecruiterDashboard);
router.post('/', authorize('recruiter'), createJob);
router.put('/:id', authorize('recruiter'), updateJob);
router.delete('/:id', authorize('recruiter'), deleteJob);
router.get('/:id/applicants', authorize('recruiter'), getApplicants);
router.put('/application/:appId/status', authorize('recruiter'), updateApplicationStatus);

module.exports = router;