const pool = require('../../db');

// Apply for a job
exports.applyToJob = async (req, res) => {
  // req.user.id comes from the 'protect' middleware after decoding the JWT
  const userId = req.user.id;
  const { jobId, resumePath, coverLetter, fullName, email, phone, quickApply } = req.body;

  console.log('Apply request received:', { userId, jobId, quickApply, fullName, email, phone });

  if (!jobId) {
    console.log('Error: No jobId provided');
    return res.status(400).json({ message: 'Job ID is required.' });
  }

  if (!userId) {
    console.log('Error: No userId from authentication');
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    // First check if the job exists
    const [jobExists] = await pool.query(
      'SELECT id FROM jobs WHERE id = ?',
      [jobId]
    );

    if (jobExists.length === 0) {
      console.log('Error: Job not found with ID:', jobId);
      return res.status(404).json({ message: 'Job not found.' });
    }

    // Check if user already applied for this job (excluding withdrawn applications)
    const [existingApplication] = await pool.query(
      'SELECT id FROM applications WHERE user_id = ? AND job_id = ? AND status != ?',
      [userId, jobId, 'Withdrawn']
    );

    if (existingApplication.length > 0) {
      console.log('Error: User already applied for job:', { userId, jobId });
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }

    console.log('Inserting application with values:', [userId, jobId, resumePath || null, coverLetter || null, fullName || null, email || null, phone || null, quickApply || false, 'Applied']);

    const [insertResult] = await pool.query(
      `INSERT INTO applications (user_id, job_id, resume_url, cover_letter, full_name, email, phone, quick_apply, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, jobId, resumePath || null, coverLetter || null, fullName || null, email || null, phone || null, quickApply || false, 'Applied']
    );

    console.log('INSERT query result:', insertResult);
    console.log('insertId from MySQL:', insertResult.insertId, 'type:', typeof insertResult.insertId);

    // For UUID fields, we need to query the newly inserted record to get the generated UUID
    const [queryResult] = await pool.query(
      'SELECT * FROM applications WHERE user_id = ? AND job_id = ? ORDER BY applied_at DESC LIMIT 1',
      [userId, jobId]
    );

    console.log('SELECT query result:', queryResult);

    if (queryResult.length === 0) {
      throw new Error('Failed to retrieve newly created application');
    }

    const applicationRecord = queryResult[0];
    console.log('Retrieved application record:', applicationRecord);
    console.log('Application ID from record:', applicationRecord.id, 'type:', typeof applicationRecord.id);
    
    const finalApplicationResponse = {
      id: applicationRecord.id, // This will be the UUID
      jobId: applicationRecord.job_id,
      userId: applicationRecord.user_id,
      applicationDate: applicationRecord.applied_at,
      status: applicationRecord.status,
      coverLetter: applicationRecord.cover_letter,
      resumePath: applicationRecord.resume_url,
      fullName: applicationRecord.full_name,
      email: applicationRecord.email,
      phone: applicationRecord.phone,
      quickApply: Boolean(applicationRecord.quick_apply)
    };

    console.log('Final application response object:', finalApplicationResponse);
    console.log('Final response ID:', finalApplicationResponse.id, 'type:', typeof finalApplicationResponse.id);
    console.log('JSON.stringify of final response:', JSON.stringify(finalApplicationResponse));

    res.status(201).json({ 
      message: 'Application submitted successfully!', 
      application: finalApplicationResponse
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while submitting application.' });
  }
};

// Get user's applications
exports.getUserApplications = async (req, res) => {
  try {
    // Use userId from params if provided, otherwise use current user's ID from token
    const userId = req.params.userId || req.user.id;
    
    const [rows] = await pool.query(`
      SELECT 
        a.id as application_id,
        a.user_id,
        a.job_id,
        a.resume_url,
        a.cover_letter,
        a.full_name,
        a.email,
        a.phone,
        a.quick_apply,
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
        j.created_at as job_created_at,
        j.salary_min,
        j.salary_max
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
        status: row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : 'Applied',
        coverLetter: row.cover_letter,
        resumeUrl: row.resume_url,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone,
        quickApply: row.quick_apply || false
      },
      job: {
        id: row.job_id,
        title: row.title,
        company: row.company_name,
        rating: 4.2,
        reviews: Math.floor(Math.random() * 1000) + 100,
        location: row.location,
        experience: row.experience_level,
        salary: row.salary_max ? Math.round(row.salary_max / 100000) : 0,
        salaryRange: row.salary_min && row.salary_max ? 
          `${Math.round(row.salary_min / 100000)}-${Math.round(row.salary_max / 100000)} LPA` : 
          'Not disclosed',
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

// Update application
exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { fullName, email, phone, coverLetter, status } = req.body;
    
    // Check if application belongs to user
    const [application] = await pool.query(
      'SELECT id FROM applications WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (application.length === 0) {
      return res.status(404).json({ message: 'Application not found.' });
    }
    
    // Build update query dynamically based on provided fields
    const updateFields = [];
    const updateValues = [];
    
    if (fullName !== undefined) {
      updateFields.push('full_name = ?');
      updateValues.push(fullName);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (coverLetter !== undefined) {
      updateFields.push('cover_letter = ?');
      updateValues.push(coverLetter);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update.' });
    }
    
    updateValues.push(id);
    
    await pool.query(
      `UPDATE applications SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    res.json({ message: 'Application updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating application.' });
  }
};

// Withdraw application
exports.withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log('Withdrawal request received:', { applicationId: id, userId });
    
    // Check if application belongs to user
    const [application] = await pool.query(
      'SELECT id, status FROM applications WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    console.log('Application found:', application);
    
    if (application.length === 0) {
      console.log('Application not found for withdrawal');
      return res.status(404).json({ message: 'Application not found.' });
    }
    
    // Update status to 'Withdrawn' instead of deleting
    const [result] = await pool.query('UPDATE applications SET status = ? WHERE id = ?', ['Withdrawn', id]);
    console.log('Withdrawal update result:', result);
    
    res.json({ message: 'Application withdrawn successfully.' });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ message: 'Error withdrawing application.' });
  }
};