const pool = require('./db');

(async () => {
  try {
    console.log('=== DATABASE SCHEMA ANALYSIS ===');
    
    // Check foreign key relationships
    console.log('\n1. APPLICATIONS-JOBS RELATIONSHIP:');
    const [appJobCheck] = await pool.query(`
      SELECT 
        a.id as app_id,
        a.job_id,
        j.id as actual_job_id,
        j.title,
        j.status as job_status
      FROM applications a
      LEFT JOIN jobs j ON a.job_id = j.id
      WHERE j.id IS NULL
      LIMIT 5
    `);
    if (appJobCheck.length > 0) {
      console.log('⚠️  ORPHANED APPLICATIONS (no matching job):');
      console.table(appJobCheck);
    } else {
      console.log('✅ All applications have valid job references');
    }
    
    console.log('\n2. APPLICATIONS-USERS RELATIONSHIP:');
    const [appUserCheck] = await pool.query(`
      SELECT 
        a.id as app_id,
        a.user_id,
        u.id as actual_user_id,
        u.email
      FROM applications a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE u.id IS NULL
      LIMIT 5
    `);
    if (appUserCheck.length > 0) {
      console.log('⚠️  ORPHANED APPLICATIONS (no matching user):');
      console.table(appUserCheck);
    } else {
      console.log('✅ All applications have valid user references');
    }
    
    console.log('\n3. JOBS-USERS RELATIONSHIP:');
    const [jobUserCheck] = await pool.query(`
      SELECT 
        j.id as job_id,
        j.title,
        j.posted_by,
        u.id as actual_user_id,
        u.email,
        u.role
      FROM jobs j
      LEFT JOIN users u ON j.posted_by = u.id
      WHERE u.id IS NULL
      LIMIT 5
    `);
    if (jobUserCheck.length > 0) {
      console.log('⚠️  ORPHANED JOBS (no matching poster):');
      console.table(jobUserCheck);
    } else {
      console.log('✅ All jobs have valid poster references');
    }
    
    console.log('\n4. ACTIVE JOBS WITH APPLICATIONS:');
    const [activeJobsWithApps] = await pool.query(`
      SELECT 
        j.id,
        j.title,
        j.status,
        j.created_at,
        COUNT(a.id) as application_count
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      WHERE j.status = 'active'
      GROUP BY j.id, j.title, j.status, j.created_at
      ORDER BY application_count DESC
    `);
    console.log('Active jobs with application counts:');
    console.table(activeJobsWithApps);
    
    console.log('\n5. USER ACTIVITY SUMMARY:');
    const [userActivity] = await pool.query(`
      SELECT 
        u.id,
        u.email,
        u.role,
        u.created_at,
        COUNT(DISTINCT CASE WHEN u.role = 'admin' OR u.role = 'employer' THEN j.id END) as jobs_posted,
        COUNT(DISTINCT CASE WHEN u.role = 'job_seeker' THEN a.id END) as applications_made
      FROM users u
      LEFT JOIN jobs j ON u.id = j.posted_by
      LEFT JOIN applications a ON u.id = a.user_id
      GROUP BY u.id, u.email, u.role, u.created_at
      ORDER BY u.created_at DESC
    `);
    console.log('User activity summary:');
    console.table(userActivity);
    
  } catch (err) {
    console.error('Database Error:', err);
  }
  process.exit();
})();
