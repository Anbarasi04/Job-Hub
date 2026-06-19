const express = require('express');
const router = express.Router();
const { generateCoverLetter, analyzeSkillGap } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

// All AI routes require login + candidate role
router.use(protect, authorize('candidate'));

router.post('/cover-letter', generateCoverLetter);
router.post('/skill-gap',    analyzeSkillGap);

module.exports = router;