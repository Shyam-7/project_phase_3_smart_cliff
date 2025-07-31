const pool = require('./db');

(async () => {
  try {
    console.log('=== CURRENT DATABASE STATE ===');
    
    // Check jobs with different criteria
    const [jobs] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_status,
        COUNT(CASE WHEN expires_at > NOW() OR expires_at IS NULL THEN 1 END) as not_expired
      FROM jobs
    `);
    
    const [apps] = await pool.query('SELECT COUNT(*) as total FROM applications');
    const [users] = await pool.query('SELECT COUNT(*) as total FROM users');
    
    console.log('Jobs - Total:', jobs[0].total);
    console.log('Jobs - Active Status:', jobs[0].active_status);
    console.log('Jobs - Not Expired:', jobs[0].not_expired);
    console.log('Applications:', apps[0].total);
    console.log('Users:', users[0].total);
    
    console.log('\n=== JOB STATUS BREAKDOWN ===');
    const [jobStatus] = await pool.query('SELECT status, COUNT(*) as count FROM jobs GROUP BY status');
    console.log('Job statuses:', jobStatus);
    
    console.log('\n=== JOB EXPIRATION BREAKDOWN ===');
    const [expiration] = await pool.query(`
      SELECT 
        CASE 
          WHEN expires_at IS NULL THEN 'No Expiration'
          WHEN expires_at > NOW() THEN 'Not Expired'
          ELSE 'Expired'
        END as expiration_status,
        COUNT(*) as count
      FROM jobs 
      GROUP BY expiration_status
    `);
    console.log('Job expiration:', expiration);
    
    console.log('\n=== RECENT JOB DETAILS ===');
    const [recentJobs] = await pool.query('SELECT id, title, status, expires_at, created_at FROM jobs ORDER BY created_at DESC LIMIT 5');
    console.table(recentJobs);
    
  } catch (err) {
    console.error('Database Error:', err);
  }
  process.exit();
})();
