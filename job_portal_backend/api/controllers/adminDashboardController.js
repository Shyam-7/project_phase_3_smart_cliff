const pool = require('../../db');

// Get comprehensive dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get total users count
    const [userCount] = await pool.query('SELECT COUNT(*) as total FROM users');
    const totalUsers = userCount[0].total;

    // Get total jobs count
    const [jobCount] = await pool.query('SELECT COUNT(*) as total FROM jobs');
    const totalJobs = jobCount[0].total;

    // Get active jobs count (not expired or NULL expires_at)
    let activeJobs;
    try {
      const [activeJobCount] = await pool.query('SELECT COUNT(*) as total FROM jobs WHERE (expires_at > NOW() OR expires_at IS NULL) AND status = "active"');
      activeJobs = activeJobCount[0].total;
    } catch (err) {
      const [activeJobCount] = await pool.query('SELECT COUNT(*) as total FROM jobs WHERE status = "active"');
      activeJobs = activeJobCount[0].total;
    }

    // Get total applications count
    const [appCount] = await pool.query('SELECT COUNT(*) as total FROM applications');
    const totalApplications = appCount[0].total;

    // Get pending applications (submitted, under review, etc.)
    const [pendingCount] = await pool.query(`
      SELECT COUNT(*) as total FROM applications 
      WHERE status IN ('submitted', 'under_review', 'pending', 'reviewing')
    `);
    const pendingApplications = pendingCount[0].total;

    // Get scheduled interviews (if status is interview or interview_scheduled)
    const [interviewCount] = await pool.query(`
      SELECT COUNT(*) as total FROM applications 
      WHERE status IN ('interview', 'interview_scheduled', 'interviewing')
    `);
    const scheduledInterviews = interviewCount[0].total;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalJobs,
        totalApplications,
        pendingApplications,
        scheduledInterviews,
        activeJobs
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

// Get recent job postings with application counts
const getRecentJobs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const [recentJobs] = await pool.query(`
      SELECT 
        j.id,
        j.title,
        j.company_name,
        j.status,
        j.created_at,
        COUNT(a.id) as applicationCount
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      GROUP BY j.id, j.title, j.company_name, j.status, j.created_at
      ORDER BY j.created_at DESC
      LIMIT ?
    `, [limit]);

    res.json({
      success: true,
      data: recentJobs
    });
  } catch (error) {
    console.error('Error fetching recent jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent jobs',
      error: error.message
    });
  }
};

// Get recent activity (applications, user registrations, etc.)
const getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    // Get recent applications
    const [recentApplications] = await pool.query(`
      SELECT 
        a.id,
        'application' as type,
        CONCAT(a.full_name, ' applied to ', j.title) as message,
        a.full_name as user_name,
        a.applied_at as timestamp
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      ORDER BY a.applied_at DESC
      LIMIT ?
    `, [limit]);

    // Get recent user registrations
    const [recentUsers] = await pool.query(`
      SELECT 
        id,
        'user_registered' as type,
        CONCAT(name, ' joined the platform') as message,
        name as user_name,
        created_at as timestamp
      FROM users
      WHERE role = 'user'
      ORDER BY created_at DESC
      LIMIT ?
    `, [limit]);

    // Get recent job postings
    const [recentJobPosts] = await pool.query(`
      SELECT 
        j.id,
        'job_posted' as type,
        CONCAT('New job posted: ', j.title, ' at ', j.company_name) as message,
        u.name as user_name,
        j.created_at as timestamp
      FROM jobs j
      LEFT JOIN users u ON j.posted_by = u.id
      ORDER BY j.created_at DESC
      LIMIT ?
    `, [limit]);

    // Combine and sort all activities
    const allActivities = [
      ...recentApplications.map(activity => ({
        ...activity,
        user_initials: activity.user_name ? activity.user_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
      })),
      ...recentUsers.map(activity => ({
        ...activity,
        user_initials: activity.user_name ? activity.user_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
      })),
      ...recentJobPosts.map(activity => ({
        ...activity,
        user_initials: activity.user_name ? activity.user_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'A'
      }))
    ];

    // Sort by timestamp and limit
    const sortedActivities = allActivities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    res.json({
      success: true,
      data: sortedActivities
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activity',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentJobs,
  getRecentActivity
};
