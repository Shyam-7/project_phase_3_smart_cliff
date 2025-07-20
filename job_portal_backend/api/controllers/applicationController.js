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
    // Check if user already applied for this job
    const [existingApplication] = await pool.query(
      'SELECT id FROM applications WHERE user_id = ? AND job_id = ?',
      [userId, jobId]
    );

    if (existingApplication.length > 0) {
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }

    const [result] = await pool.query(
      'INSERT INTO applications (user_id, job_id, resume_url, cover_letter) VALUES (?, ?, ?, ?)',
      [userId, jobId, resumeUrl, coverLetter]
    );
    res.status(201).json({ 
      message: 'Application submitted successfully!', 
      applicationId: result.insertId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while submitting application.' });
  }
};

// Get user's applications
exports.getUserApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [rows] = await pool.query(`
      SELECT a.*, j.title, j.company_name, j.location, j.employment_type
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.user_id = ?
      ORDER BY a.applied_at DESC
    `, [userId]);
    
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching user applications.' });
  }
};

// Withdraw application
exports.withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if application belongs to user
    const [application] = await pool.query(
      'SELECT id FROM applications WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (application.length === 0) {
      return res.status(404).json({ message: 'Application not found.' });
    }
    
    await pool.query('DELETE FROM applications WHERE id = ?', [id]);
    res.json({ message: 'Application withdrawn successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error withdrawing application.' });
  }
};