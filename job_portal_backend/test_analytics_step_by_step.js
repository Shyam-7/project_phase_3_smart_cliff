// test_analytics_step_by_step.js - Debug analytics queries step by step
const pool = require('./db');

async function testAnalyticsStepByStep() {
  try {
    console.log('🧪 Testing analytics queries step by step...');
    
    // Test each query individually
    console.log('\n1️⃣ Testing total users...');
    try {
      const [totalUsersResult] = await pool.query('SELECT COUNT(*) as count FROM users');
      console.log(`✅ Total users: ${totalUsersResult[0].count}`);
    } catch (e) {
      console.log(`❌ Total users failed: ${e.message}`);
    }

    console.log('\n2️⃣ Testing active users...');
    try {
      const [activeUsersResult] = await pool.query('SELECT COUNT(*) as count FROM users WHERE status = "active"');
      console.log(`✅ Active users: ${activeUsersResult[0].count}`);
    } catch (e) {
      console.log(`❌ Active users failed: ${e.message}`);
    }

    console.log('\n3️⃣ Testing total applications...');
    try {
      const [totalApplicationsResult] = await pool.query('SELECT COUNT(*) as count FROM applications WHERE status != "Withdrawn"');
      console.log(`✅ Total applications: ${totalApplicationsResult[0].count}`);
    } catch (e) {
      console.log(`❌ Total applications failed: ${e.message}`);
    }

    console.log('\n4️⃣ Testing active jobs...');
    try {
      const [activeJobsResult] = await pool.query('SELECT COUNT(*) as count FROM jobs WHERE status = "active"');
      console.log(`✅ Active jobs: ${activeJobsResult[0].count}`);
    } catch (e) {
      console.log(`❌ Active jobs failed: ${e.message}`);
    }

    console.log('\n5️⃣ Testing job categories...');
    try {
      const [jobCategoriesResult] = await pool.query(`
        SELECT 
          COALESCE(category, 'Other') as category,
          COUNT(*) as count
        FROM jobs 
        WHERE status = "active"
        GROUP BY category
        ORDER BY count DESC
      `);
      console.log(`✅ Job categories:`, jobCategoriesResult);
    } catch (e) {
      console.log(`❌ Job categories failed: ${e.message}`);
    }

    console.log('\n6️⃣ Testing application statuses...');
    try {
      const [applicationStatusesResult] = await pool.query(`
        SELECT 
          status,
          COUNT(*) as count,
          ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM applications WHERE status != 'Withdrawn')), 1) as percentage
        FROM applications 
        WHERE status != 'Withdrawn'
        GROUP BY status
        ORDER BY count DESC
      `);
      console.log(`✅ Application statuses:`, applicationStatusesResult);
    } catch (e) {
      console.log(`❌ Application statuses failed: ${e.message}`);
    }

    console.log('\n7️⃣ Testing monthly users...');
    try {
      const [monthlyUsersResult] = await pool.query(`
        SELECT 
          DATE_FORMAT(created_at, '%b') as month,
          DATE_FORMAT(created_at, '%Y-%m') as year_month,
          COUNT(*) as users
        FROM users 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%b')
        ORDER BY year_month ASC
      `);
      console.log(`✅ Monthly users:`, monthlyUsersResult);
    } catch (e) {
      console.log(`❌ Monthly users failed: ${e.message}`);
    }

    console.log('\n8️⃣ Testing monthly applications...');
    try {
      const [monthlyApplicationsResult] = await pool.query(`
        SELECT 
          DATE_FORMAT(applied_at, '%b') as month,
          DATE_FORMAT(applied_at, '%Y-%m') as year_month,
          COUNT(*) as applications
        FROM applications 
        WHERE applied_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(applied_at, '%Y-%m'), DATE_FORMAT(applied_at, '%b')
        ORDER BY year_month ASC
      `);
      console.log(`✅ Monthly applications:`, monthlyApplicationsResult);
    } catch (e) {
      console.log(`❌ Monthly applications failed: ${e.message}`);
    }

    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Error in step-by-step test:', error);
  } finally {
    process.exit(0);
  }
}

testAnalyticsStepByStep();
