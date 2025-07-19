const pool = require('../../db');

// Apply for a job
exports.applyToJob = async (req, res) => {
  // req.user.id comes from the 'protect' middleware after decoding the JWT
  const userId = req.user.id;
  const { jobId, resumeUrl, coverLetter } = req.body;

  if (!jobId) {
    return res.status(400).json({ message: 'Job ID is required.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO applications (user_id, job_id, resume_url, cover_letter) VALUES (?, ?, ?, ?)',
      [userId, jobId, resumeUrl, coverLetter]
    );
    res.status(201).json({ message: 'Application submitted successfully!', applicationId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while submitting application.' });
  }
};