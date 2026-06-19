const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    companyLogo: { type: String, default: '' },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
      required: true,
    },
    category: {
      type: String,
      enum: [
        'Technology',
        'Design',
        'Marketing',
        'Finance',
        'Healthcare',
        'Education',
        'Sales',
        'Engineering',
        'Other',
      ],
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    requirements: [{ type: String }],
    responsibilities: [{ type: String }],
    skills: [{ type: String }],
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    salaryCurrency: { type: String, default: 'USD' },
    experienceLevel: {
      type: String,
      enum: ['Entry', 'Mid', 'Senior', 'Lead', 'Executive'],
    },
    deadline: { type: Date },
    isActive: { type: Boolean, default: true },
    applicantsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index for search
jobSchema.index({
  title: 'text',
  company: 'text',
  description: 'text',
  skills: 'text',
  location: 'text',
});

module.exports = mongoose.model('Job', jobSchema);