const pool = require('./db');

async function testCleanQuery() {
  try {
    console.log('Testing clean query...');
    
    const [result] = await pool.query(
      "SELECT DATE_FORMAT(created_at, '%Y-%m') as year_month, COUNT(*) as users FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY year_month ASC"
    );
    console.log('✅ Result:', result);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

testCleanQuery();
