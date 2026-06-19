const express = require('express');
const router = express.Router();
const {
  upsertProfile,
  getMyProfile,
  applyJob,
  getMyApplications,
  getDashboard,
} = require('../controllers/candidateController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('candidate'));

router.get('/profile', getMyProfile);
router.put('/profile', upsertProfile);
router.post('/apply/:jobId', applyJob);
router.get('/applications', getMyApplications);
router.get('/dashboard', getDashboard);

module.exports = router;