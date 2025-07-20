const pool = require('../../db');

// Apply for a job
exports.applyToJob = async (req, res) => {
  // req.user.id comes from the 'protect' middleware after decoding the JWT
  const userId = req.user.id;
  const { jobId, resumePath, coverLetter, fullName, email, phone, quickApply } = req.body;

  console.log('Apply request received:', { userId, jobId, quickApply });

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
      'INSERT INTO applications (user_id, job_id, resume_url, cover_letter, status) VALUES (?, ?, ?, ?, ?)',
      [userId, jobId, resumePath || null, coverLetter || null, 'applied']
    );

    const applicationResponse = {
      id: result.insertId,
      jobId: jobId,
      userId: userId,
      applicationDate: new Date().toISOString(),
      status: 'applied',
      coverLetter: coverLetter || null,
      resumePath: resumePath || null,
      quickApply: quickApply || false
    };

    res.status(201).json({ 
      message: 'Application submitted successfully!', 
      application: applicationResponse
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
      SELECT 
        a.id as application_id,
        a.user_id,
        a.job_id,
        a.resume_url,
        a.cover_letter,
        a.status,
        a.applied_at,
        j.id as job_id,
        j.title,
        j.company_name,
        j.location,
        j.employment_type,
        j.experience_level,
        j.category,
        j.description,
        j.requirements,
        j.views,
        j.created_at as job_created_at
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.user_id = ?
      ORDER BY a.applied_at DESC
    `, [userId]);
    
    // Transform the data to match frontend expectations
    const transformedData = rows.map(row => ({
      application: {
        id: row.application_id,
        jobId: row.job_id,
        userId: row.user_id,
        applicationDate: row.applied_at,
        status: row.status,
        coverLetter: row.cover_letter,
        resumeUrl: row.resume_url,
        quickApply: !row.cover_letter // Assume quick apply if no cover letter
      },
      job: {
        id: row.job_id,
        title: row.title,
        company: row.company_name,
        rating: 4.2,
        reviews: Math.floor(Math.random() * 1000) + 100,
        location: row.location,
        experience: row.experience_level,
        salary: Math.floor(Math.random() * 50) + 50,
        postedDate: row.job_created_at,
        summary: row.description ? row.description.substring(0, 150) + '...' : '',
        companyType: 'Corporate',
        tags: [row.category, row.employment_type].filter(Boolean),
        posted: row.job_created_at,
        logo: null,
        logoText: row.company_name ? row.company_name.charAt(0).toUpperCase() : 'C',
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
        employment_type: row.employment_type,
        experience_level: row.experience_level,
        category: row.category,
        requirements: row.requirements,
        views: row.views || 0
      }
    }));
    
    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching user applications:', error);
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