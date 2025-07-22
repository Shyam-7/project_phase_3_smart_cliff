const pool = require('../../db');

// Transform database job data to match frontend expectations
const transformJobData = (dbJob) => {
  // Calculate salary in LPA (if in INR)
  const salaryMin = dbJob.salary_min ? Math.round(dbJob.salary_min / 100000) : null;
  const salaryMax = dbJob.salary_max ? Math.round(dbJob.salary_max / 100000) : null;
  const salaryDisplay = salaryMin && salaryMax ? 
    (salaryMin === salaryMax ? `${salaryMin} LPA` : `${salaryMin}-${salaryMax} LPA`) : 
    'Not disclosed';

  return {
    id: dbJob.id, // Keep original UUID instead of converting to integer
    title: dbJob.title,
    company: dbJob.company_name,
    rating: dbJob.company_rating || 4.0,
    reviews: dbJob.company_reviews_count || 0,
    location: dbJob.location,
    experience: dbJob.experience_level,
    salary: salaryMax || 0, // For sorting purposes
    salaryRange: salaryDisplay,
    postedDate: dbJob.created_at,
    summary: dbJob.description ? dbJob.description.substring(0, 150) + '...' : '',
    companyType: dbJob.company_type || 'Corporate',
    tags: [
      dbJob.category, 
      dbJob.employment_type,
      ...(dbJob.skills_required ? dbJob.skills_required.split(',').slice(0, 3) : [])
    ].filter(Boolean),
    posted: dbJob.created_at,
    logo: null,
    logoText: dbJob.company_name ? dbJob.company_name.charAt(0).toUpperCase() : 'C',
    color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Random color
    description: {
      overview: dbJob.description || '',
      responsibilities: dbJob.requirements ? dbJob.requirements.split('.').filter(r => r.trim()) : [],
      qualifications: dbJob.requirements ? dbJob.requirements.split('.').filter(r => r.trim()) : [],
      skills: dbJob.skills_required ? dbJob.skills_required.split(',').map(s => s.trim()) : [],
      benefits: dbJob.benefits ? dbJob.benefits.split(',').map(b => b.trim()) : [],
      meta: {
        role: dbJob.title,
        industry: dbJob.category || 'Technology',
        department: dbJob.category || 'Engineering',
        employment: dbJob.employment_type || 'Full-time',
        category: dbJob.category || 'Software Development',
        companySize: dbJob.company_size || 'Not specified',
        remote: dbJob.remote_allowed ? 'Remote allowed' : 'On-site',
        education: {
          UG: 'Any Graduate',
          PG: 'Not required'
        }
      }
    },
    employment_type: dbJob.employment_type,
    experience_level: dbJob.experience_level,
    category: dbJob.category,
    requirements: dbJob.requirements,
    views: dbJob.views || 0,
    expires_at: dbJob.expires_at,
    salary_min: dbJob.salary_min,
    salary_max: dbJob.salary_max,
    remote_allowed: dbJob.remote_allowed,
    company_size: dbJob.company_size
  };
};

// Get all active jobs with filtering and sorting
exports.getAllJobs = async (req, res) => {
  try {
    const { 
      category, 
      location, 
      experience, 
      employment_type, 
      salary_min, 
      salary_max, 
      remote_allowed, 
      company_type,
      sort_by = 'created_at',
      sort_order = 'DESC',
      search
    } = req.query;

    let query = 'SELECT * FROM jobs WHERE status = "active"';
    const params = [];

    // Add filters
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (location && location !== 'All') {
      if (location === 'Remote') {
        query += ' AND (remote_allowed = TRUE OR location = "Remote")';
      } else if (location === 'Hybrid') {
        query += ' AND location = "Hybrid"';
      } else if (location === 'On-site') {
        query += ' AND (location = "On-site" OR (location NOT IN ("Remote", "Hybrid") AND remote_allowed = FALSE))';
      } else {
        // For city names
        query += ' AND location LIKE ?';
        params.push(`%${location}%`);
      }
    }
    
    if (experience) {
      query += ' AND experience_level = ?';
      params.push(experience);
    }
    
    if (employment_type) {
      query += ' AND employment_type = ?';
      params.push(employment_type);
    }
    
    if (company_type) {
      query += ' AND company_type = ?';
      params.push(company_type);
    }
    
    if (salary_min) {
      query += ' AND salary_max >= ?';
      params.push(parseInt(salary_min) * 100000); // Convert LPA to actual amount
    }
    
    if (salary_max) {
      query += ' AND salary_min <= ?';
      params.push(parseInt(salary_max) * 100000);
    }
    
    if (remote_allowed === 'true') {
      query += ' AND remote_allowed = TRUE';
    }
    
    if (search) {
      query += ' AND (title LIKE ? OR company_name LIKE ? OR description LIKE ? OR skills_required LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Add sorting
    const validSortFields = ['created_at', 'salary_max', 'views', 'title', 'company_name'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY ${sortField} ${sortDirection}`;

    const [rows] = await pool.query(query, params);
    const transformedJobs = rows.map(transformJobData);
    res.json(transformedJobs);
  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs.', error });
  }
};

// Get a single job by its ID
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.query('SELECT * FROM jobs WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Job not found.' });
    }
    
    const transformedJob = transformJobData(rows[0]);
    res.json(transformedJob);
  } catch (error) {
    console.error('❌ Error fetching job details:', error);
    res.status(500).json({ message: 'Error fetching job details.', error });
  }
};

// Create a new job (Admin only)
exports.createJob = async (req, res) => {
  try {
    const userId = req.user.id; // Admin user ID from JWT
    
    console.log('Creating job with data:', JSON.stringify(req.body, null, 2));
    
    const {
      title,
      company,
      company_name,
      location,
      experience,
      experience_level,
      salary,
      salary_min,
      salary_max,
      description,
      employment_type = 'Full-time',
      category = 'Technology',
      skills_required,
      benefits,
      company_size,
      company_type = 'Corporate',
      company_rating,
      company_reviews_count,
      remote_allowed = false,
      expires_at,
      status = 'active',
      requirements,
      summary
    } = req.body;

    // Handle company name (accept both company and company_name)
    const companyName = company_name || company;

    // Validation
    if (!title || !companyName || !location) {
      return res.status(400).json({ 
        message: 'Title, company, and location are required fields.' 
      });
    }

    // Handle salary ranges
    let finalSalaryMin = null;
    let finalSalaryMax = null;
    
    // Priority: salary_min/salary_max > salary > default
    if (salary_min && salary_max) {
      finalSalaryMin = parseFloat(salary_min) * 100000; // Convert LPA to INR
      finalSalaryMax = parseFloat(salary_max) * 100000;
    } else if (salary && typeof salary === 'number') {
      finalSalaryMin = salary * 100000;
      finalSalaryMax = salary * 100000;
    }

    // Handle experience level
    const experienceLevel = experience_level || experience || '';

    // Convert skills array to comma-separated string
    const skillsString = Array.isArray(description?.skills) 
      ? description.skills.join(', ') 
      : skills_required || '';

    // Handle description (can be object or string)
    const descriptionText = typeof description === 'object' 
      ? description.overview || description.description || '' 
      : description || '';

    // Handle requirements
    const requirementsText = requirements || 
      (typeof description === 'object' && Array.isArray(description.responsibilities) 
        ? description.responsibilities.join('. ')
        : '');

    // Handle summary
    const summaryText = summary || 
      (typeof description === 'object' ? description.summary : '') || '';

    const [result] = await pool.query(
      `INSERT INTO jobs (
        title, company_name, location, employment_type, experience_level, 
        category, description, requirements, posted_by, salary_min, salary_max,
        remote_allowed, skills_required, benefits, company_size, company_type,
        expires_at, status, company_rating, company_reviews_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        companyName,
        location,
        employment_type,
        experienceLevel,
        category,
        descriptionText,
        requirementsText,
        userId,
        finalSalaryMin,
        finalSalaryMax,
        remote_allowed,
        skillsString,
        benefits,
        company_size,
        company_type,
        expires_at,
        status || 'active',
        company_rating || null,
        company_reviews_count || 0
      ]
    );

    // Fetch the newly created job
    const [newJob] = await pool.query(
      'SELECT * FROM jobs WHERE id = (SELECT id FROM jobs WHERE posted_by = ? ORDER BY created_at DESC LIMIT 1)',
      [userId]
    );

    if (newJob.length === 0) {
      throw new Error('Failed to retrieve newly created job');
    }

    console.log('Job created successfully:', newJob[0].id);
    res.status(201).json({
      message: 'Job created successfully!',
      job: transformJobData(newJob[0])
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Server error while creating job.', error });
  }
};

// Update an existing job (Admin only)
exports.updateJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;
    
    console.log('Updating job:', jobId, 'with data:', JSON.stringify(req.body, null, 2));

    const {
      title,
      company,
      location,
      experience,
      salary,
      description,
      employment_type,
      category,
      skills_required,
      benefits,
      company_size,
      company_type,
      remote_allowed,
      expires_at,
      status = 'active'
    } = req.body;

    // Check if job exists
    const [existingJob] = await pool.query(
      'SELECT * FROM jobs WHERE id = ?',
      [jobId]
    );

    if (existingJob.length === 0) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    // Convert salary to min/max if it's a single value
    let salary_min = existingJob[0].salary_min;
    let salary_max = existingJob[0].salary_max;
    
    if (salary && typeof salary === 'number') {
      salary_min = salary * 100000;
      salary_max = salary * 100000;
    }

    // Convert skills array to comma-separated string
    const skillsString = Array.isArray(description?.skills) 
      ? description.skills.join(', ') 
      : skills_required || existingJob[0].skills_required;

    // Convert description object to text
    const descriptionText = typeof description === 'object' 
      ? description.overview || existingJob[0].description 
      : description || existingJob[0].description;

    // Convert responsibilities to requirements text
    const requirementsText = description?.responsibilities 
      ? description.responsibilities.join('. ') 
      : existingJob[0].requirements;

    await pool.query(
      `UPDATE jobs SET 
        title = ?, company_name = ?, location = ?, employment_type = ?, 
        experience_level = ?, category = ?, description = ?, requirements = ?,
        salary_min = ?, salary_max = ?, remote_allowed = ?, skills_required = ?,
        benefits = ?, company_size = ?, company_type = ?, expires_at = ?, 
        status = ?, updated_at = NOW()
      WHERE id = ?`,
      [
        title || existingJob[0].title,
        company || existingJob[0].company_name,
        location || existingJob[0].location,
        employment_type || existingJob[0].employment_type,
        experience || existingJob[0].experience_level,
        category || existingJob[0].category,
        descriptionText,
        requirementsText,
        salary_min,
        salary_max,
        remote_allowed !== undefined ? remote_allowed : existingJob[0].remote_allowed,
        skillsString,
        benefits || existingJob[0].benefits,
        company_size || existingJob[0].company_size,
        company_type || existingJob[0].company_type,
        expires_at || existingJob[0].expires_at,
        status,
        jobId
      ]
    );

    // Fetch the updated job
    const [updatedJob] = await pool.query(
      'SELECT * FROM jobs WHERE id = ?',
      [jobId]
    );

    console.log('Job updated successfully:', jobId);
    res.json({
      message: 'Job updated successfully!',
      job: transformJobData(updatedJob[0])
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Server error while updating job.', error });
  }
};

// Delete a job (Admin only)
exports.deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    
    console.log('Deleting job:', jobId);

    // Check if job exists
    const [existingJob] = await pool.query(
      'SELECT * FROM jobs WHERE id = ?',
      [jobId]
    );

    if (existingJob.length === 0) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    // Check if there are any applications for this job
    const [applications] = await pool.query(
      'SELECT COUNT(*) as count FROM applications WHERE job_id = ?',
      [jobId]
    );

    const applicationCount = applications[0].count;

    if (applicationCount > 0) {
      // If there are applications, mark as inactive instead of deleting
      await pool.query(
        'UPDATE jobs SET status = "inactive", updated_at = NOW() WHERE id = ?',
        [jobId]
      );
      
      console.log('Job marked as inactive due to existing applications:', jobId);
      res.json({ 
        message: `Job marked as inactive. It had ${applicationCount} applications.`,
        deleted: false,
        applicationCount 
      });
    } else {
      // If no applications, safely delete
      await pool.query('DELETE FROM jobs WHERE id = ?', [jobId]);
      
      console.log('Job deleted successfully:', jobId);
      res.json({ 
        message: 'Job deleted successfully!',
        deleted: true 
      });
    }
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Server error while deleting job.', error });
  }
};