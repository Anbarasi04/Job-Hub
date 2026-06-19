const CandidateProfile = require('../models/CandidateProfile');

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Helper: call Gemini API
const callGemini = async (prompt) => {
  const response = await fetch(
    `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || 'Gemini API error');
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

// @desc    Generate AI cover letter for a job
// @route   POST /api/ai/cover-letter
// @access  Private (Candidate)
exports.generateCoverLetter = async (req, res, next) => {
  try {
    const { jobTitle, company, jobDescription, skills: jobSkills } = req.body;

    if (!jobTitle || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Job title and description are required',
      });
    }

    // Fetch candidate's profile for personalization
    const profile = await CandidateProfile.findOne({
      user: req.user._id,
    }).populate('user', 'name email');

    const candidateName = profile?.user?.name || req.user.name;
    const candidateHeadline = profile?.headline || '';
    const candidateSkills = profile?.skills?.join(', ') || '';
    const candidateBio = profile?.bio || '';
    const recentExp = profile?.experience?.[0];
    const recentExpText = recentExp
      ? `${recentExp.title} at ${recentExp.company}`
      : '';

    const prompt = `
You are a professional career coach writing a compelling job application cover letter.

CANDIDATE INFORMATION:
- Name: ${candidateName}
- Headline: ${candidateHeadline}
- Skills: ${candidateSkills}
- Bio: ${candidateBio}
- Most Recent Experience: ${recentExpText}

JOB INFORMATION:
- Job Title: ${jobTitle}
- Company: ${company}
- Job Description: ${jobDescription}
- Required Skills: ${Array.isArray(jobSkills) ? jobSkills.join(', ') : jobSkills || ''}

INSTRUCTIONS:
Write a professional, personalized cover letter (3-4 paragraphs, ~250 words) that:
1. Opens with genuine enthusiasm for the specific role and company
2. Highlights 2-3 of the candidate's most relevant skills/experiences that match the job
3. Shows understanding of the company's needs based on the job description
4. Closes with a confident call-to-action

Write ONLY the cover letter body (no subject line, no "Dear Hiring Manager" header needed). 
Make it sound natural and human — not generic or robotic.
Start directly with the opening paragraph.
`.trim();

    const coverLetter = await callGemini(prompt);

    res.json({ success: true, coverLetter: coverLetter.trim() });
  } catch (err) {
    next(err);
  }
};

// @desc    Analyze job and suggest missing skills
// @route   POST /api/ai/skill-gap
// @access  Private (Candidate)
exports.analyzeSkillGap = async (req, res, next) => {
  try {
    const { jobTitle, jobDescription, requiredSkills } = req.body;

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Job description is required',
      });
    }

    // Fetch candidate's profile
    const profile = await CandidateProfile.findOne({ user: req.user._id });
    const candidateSkills = profile?.skills || [];
    const experience = profile?.experience || [];
    const education = profile?.education || [];

    const expSummary = experience
      .map((e) => `${e.title} at ${e.company}`)
      .join('; ');
    const eduSummary = education
      .map((e) => `${e.degree} in ${e.fieldOfStudy} from ${e.school}`)
      .join('; ');

    const prompt = `
You are an expert career advisor and technical recruiter analyzing a skill gap.

CANDIDATE'S CURRENT PROFILE:
- Skills: ${candidateSkills.length ? candidateSkills.join(', ') : 'None listed'}
- Experience: ${expSummary || 'None listed'}
- Education: ${eduSummary || 'None listed'}

TARGET JOB:
- Title: ${jobTitle}
- Required Skills: ${Array.isArray(requiredSkills) ? requiredSkills.join(', ') : requiredSkills || 'Not specified'}
- Job Description: ${jobDescription}

TASK: Analyze the gap between the candidate's profile and this job. Respond ONLY with a valid JSON object in this exact format (no markdown, no explanation, just JSON):

{
  "matchScore": <number 0-100 representing overall match percentage>,
  "matchedSkills": [<list of skills the candidate already has that match the job>],
  "missingSkills": [
    {
      "skill": "<skill name>",
      "priority": "<High | Medium | Low>",
      "reason": "<one sentence why this skill matters for this role>",
      "howToLearn": "<specific resource or approach to learn it>"
    }
  ],
  "strengths": [<2-3 things the candidate does well for this role>],
  "summary": "<2-sentence overall assessment of the candidate's fit>"
}
`.trim();

    const raw = await callGemini(prompt);

    // Safely parse JSON from Gemini response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({
        success: false,
        message: 'AI returned an unexpected format. Please try again.',
      });
    }

    const analysis = JSON.parse(jsonMatch[0]);

    res.json({ success: true, analysis });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to parse AI response. Please try again.',
      });
    }
    next(err);
  }
};