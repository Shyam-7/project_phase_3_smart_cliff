// debug_analytics.js - Debug analytics database queries
const pool = require('./db');

async function debugAnalytics() {
  try {
    console.log('🔍 Debugging analytics database queries...');
    
    // Check database connection
    console.log('📡 Testing database connection...');
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful');
    
    // Check what tables exist
    console.log('📋 Checking available tables...');
    const [tables] = await pool.query('SHOW TABLES');
    console.log('Available tables:', tables.map(t => Object.values(t)[0]));
    
    // Check users table
    console.log('👥 Checking users table...');
    const [usersCount] = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`Users count: ${usersCount[0].count}`);
    
    // Check if applications table exists
    console.log('📝 Checking for applications table...');
    try {
      const [appsCount] = await pool.query('SELECT COUNT(*) as count FROM applications');
      console.log(`Applications count: ${appsCount[0].count}`);
      
      // Check applications table structure
      const [appsStructure] = await pool.query('DESCRIBE applications');
      console.log('Applications table structure:', appsStructure);
      
    } catch (appError) {
      console.log('❌ Applications table error:', appError.message);
      
      // Create applications table if it doesn't exist
      console.log('🛠️ Creating applications table...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS applications (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          job_title VARCHAR(255) DEFAULT 'Software Developer',
          company VARCHAR(255) DEFAULT 'Tech Company',
          status ENUM('Pending', 'Reviewed', 'Interview', 'Rejected', 'Accepted', 'Withdrawn') DEFAULT 'Pending',
          applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          cover_letter TEXT,
          resume_url VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ Applications table created');
      
      // Insert some sample data
      console.log('📊 Adding sample application data...');
      const [users] = await pool.query('SELECT id FROM users LIMIT 5');
      
      const sampleJobs = [
        'Software Developer', 'Frontend Developer', 'Backend Developer', 
        'UI/UX Designer', 'Marketing Manager', 'Data Analyst',
        'Product Manager', 'DevOps Engineer', 'QA Tester', 'Finance Analyst'
      ];
      
      const sampleCompanies = [
        'TechCorp', 'InnovateLabs', 'DataSystems', 'DesignStudio', 
        'StartupHub', 'GlobalTech', 'CloudSolutions', 'DevCompany'
      ];
      
      const statuses = ['Pending', 'Reviewed', 'Interview', 'Rejected', 'Accepted'];
      
      for (let i = 0; i < 25; i++) {
        const userId = users[Math.floor(Math.random() * users.length)].id;
        const jobTitle = sampleJobs[Math.floor(Math.random() * sampleJobs.length)];
        const company = sampleCompanies[Math.floor(Math.random() * sampleCompanies.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        await pool.query(`
          INSERT INTO applications (id, user_id, job_title, company, status, applied_date)
          VALUES (UUID(), ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 90) DAY))
        `, [userId, jobTitle, company, status]);
      }
      console.log('✅ Sample application data added');
    }
    
    // Test the analytics queries individually
    console.log('🧪 Testing individual analytics queries...');
    
    try {
      const [totalUsers] = await pool.query('SELECT COUNT(*) as count FROM users');
      console.log(`✅ Total users: ${totalUsers[0].count}`);
    } catch (e) { console.log('❌ Total users query failed:', e.message); }
    
    try {
      const [activeUsers] = await pool.query('SELECT COUNT(*) as count FROM users WHERE status = "active"');
      console.log(`✅ Active users: ${activeUsers[0].count}`);
    } catch (e) { console.log('❌ Active users query failed:', e.message); }
    
    try {
      const [totalApps] = await pool.query('SELECT COUNT(*) as count FROM applications WHERE status != "Withdrawn"');
      console.log(`✅ Total applications: ${totalApps[0].count}`);
    } catch (e) { console.log('❌ Total applications query failed:', e.message); }
    
    try {
      const [activeJobs] = await pool.query('SELECT COUNT(DISTINCT COALESCE(job_title, "Software Developer")) as count FROM applications');
      console.log(`✅ Active jobs: ${activeJobs[0].count}`);
    } catch (e) { console.log('❌ Active jobs query failed:', e.message); }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    process.exit(0);
  }
}

debugAnalytics();
