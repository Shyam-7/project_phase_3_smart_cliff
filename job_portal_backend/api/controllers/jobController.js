const pool = require('../../db');

// Transform database job data to match frontend expectations
const transformJobData = (dbJob) => {
  return {
    id: parseInt(dbJob.id) || dbJob.id,
    title: dbJob.title,
    company: dbJob.company_name,
    rating: 4.2, // Default rating since not in DB
    reviews: Math.floor(Math.random() * 1000) + 100, // Random reviews for now
    location: dbJob.location,
    experience: dbJob.experience_level,
    salary: Math.floor(Math.random() * 50) + 50, // Random salary in LPA
    postedDate: dbJob.created_at,
    summary: dbJob.description ? dbJob.description.substring(0, 150) + '...' : '',
    companyType: 'Corporate', // Default value
    tags: dbJob.category ? [dbJob.category, dbJob.employment_type].filter(Boolean) : [],
    posted: dbJob.created_at,
    logo: null,
    logoText: dbJob.company_name ? dbJob.company_name.charAt(0).toUpperCase() : 'C',
    color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Random color
    description: {
      overview: dbJob.description || '',
      responsibilities: dbJob.requirements ? dbJob.requirements.split('.').filter(r => r.trim()) : [],
      qualifications: dbJob.requirements ? dbJob.requirements.split('.').filter(r => r.trim()) : [],
      skills: dbJob.category ? [
        'JavaScript', 'React', 'Node.js', 'TypeScript', 'MySQL', 'Git',
        'Problem Solving', 'Team Collaboration', 'Communication'
      ].slice(0, Math.floor(Math.random() * 5) + 3) : [],
      meta: {
        role: dbJob.title,
        industry: dbJob.category || 'Technology',
        department: dbJob.category || 'Engineering',
        employment: dbJob.employment_type || 'Full-time',
        category: dbJob.category || 'Software Development',
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
    expires_at: dbJob.expires_at
  };
};

// Get all active jobs
exports.getAllJobs = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM jobs WHERE status = "active" ORDER BY created_at DESC');
    const transformedJobs = rows.map(transformJobData);
    res.json(transformedJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
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
    console.error('Error fetching job details:', error);
    res.status(500).json({ message: 'Error fetching job details.', error });
  }
};