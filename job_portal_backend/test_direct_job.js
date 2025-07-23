const pool = require('./db');

async function testDirectJobCreation() {
  try {
    console.log('Testing direct job creation...');
    
    // Test data that matches the database schema exactly
    const jobData = {
      title: 'Test Software Engineer',
      company_name: 'Test Tech Company',
      location: 'Bangalore',
      employment_type: 'Full-time',
      experience_level: '2-4 years',
      category: 'Technology',
      description: 'This is a test job for software engineer position',
      requirements: 'Requirements: Node.js, React, JavaScript',
      posted_by: '550e8400-e29b-41d4-a716-446655440000', // Admin user ID
      salary_min: 500000.00,
      salary_max: 800000.00,
      remote_allowed: false,
      skills_required: 'Node.js, React, JavaScript',
      status: 'active'
    };

    console.log('Inserting job with data:', JSON.stringify(jobData, null, 2));
    
    const [result] = await pool.query('INSERT INTO jobs SET ?', jobData);
    console.log('Insert result:', result);
    console.log('Inserted job ID:', result.insertId);
    
    // Try to fetch the job by title
    const [rows] = await pool.query('SELECT * FROM jobs WHERE title = ? ORDER BY created_at DESC LIMIT 1', [jobData.title]);
    console.log('Retrieved job count:', rows.length);
    if (rows.length > 0) {
      console.log('Retrieved job ID:', rows[0].id);
      console.log('Retrieved job title:', rows[0].title);
      console.log('Retrieved job company:', rows[0].company_name);
      
      // Clean up
      await pool.query('DELETE FROM jobs WHERE id = ?', [rows[0].id]);
      console.log('Test job cleaned up');
    }
    
    console.log('✅ Direct job creation test passed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing direct job creation:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

testDirectJobCreation();
