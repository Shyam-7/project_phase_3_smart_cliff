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