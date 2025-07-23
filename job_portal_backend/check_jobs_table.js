// check_jobs_table.js - Check jobs table structure
const pool = require('./db');

async function checkJobsTable() {
  try {
    console.log('🔍 Checking jobs table structure...');
    
    // Check jobs table structure
    const [jobsStructure] = await pool.query('DESCRIBE jobs');
    console.log('Jobs table structure:');
    jobsStructure.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });
    
    // Check sample data
    console.log('\n📊 Sample jobs data:');
    const [sampleJobs] = await pool.query('SELECT * FROM jobs LIMIT 3');
    console.log(sampleJobs);
    
    // Count total jobs
    const [jobsCount] = await pool.query('SELECT COUNT(*) as count FROM jobs');
    console.log(`\n📈 Total jobs in database: ${jobsCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Error checking jobs table:', error.message);
  } finally {
    process.exit(0);
  }
}

checkJobsTable();
