const pool = require('./db');

async function checkApplications() {
  try {
    console.log('Checking applications in database...');
    
    const [applications] = await pool.query(`
      SELECT a.*, u.name as user_name, j.title as job_title 
      FROM applications a 
      LEFT JOIN users u ON a.user_id = u.id 
      LEFT JOIN jobs j ON a.job_id = j.id 
      ORDER BY a.applied_at DESC 
      LIMIT 10
    `);
    
    console.log('Recent applications:');
    applications.forEach((app, index) => {
      console.log(`${index + 1}. User: ${app.user_name}, Job: ${app.job_title}, Status: ${app.status}, Applied: ${app.applied_at}`);
    });
    
    console.log(`Total recent applications: ${applications.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking applications:', error);
    process.exit(1);
  }
}

checkApplications();
