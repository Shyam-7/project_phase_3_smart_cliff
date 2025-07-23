// simple_monthly_test.js - Test just the monthly queries
const pool = require('./db');

async function simpleMonthlyTest() {
  try {
    console.log('🧪 Testing simple monthly query...');
    
    // Test a simpler version first
    const [simpleResult] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as year_month,
        COUNT(*) as users
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY year_month ASC
    `);
    console.log('✅ Simple monthly users:', simpleResult);
    
    // Test applications
    const [appsResult] = await pool.query(`
      SELECT 
        DATE_FORMAT(applied_at, '%Y-%m') as year_month,
        COUNT(*) as applications
      FROM applications 
      WHERE applied_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(applied_at, '%Y-%m')
      ORDER BY year_month ASC
    `);
    console.log('✅ Simple monthly applications:', appsResult);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

simpleMonthlyTest();
