const pool = require('./db');

async function debugQuery() {
  try {
    console.log('Testing basic query...');
    
    // Test most basic query first
    const [result1] = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log('✅ Basic count:', result1);
    
    // Test date formatting
    const [result2] = await pool.query('SELECT DATE_FORMAT(NOW(), "%Y-%m") as test');
    console.log('✅ Date format test:', result2);
    
    // Test with date filter
    const [result3] = await pool.query('SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)');
    console.log('✅ Date filter test:', result3);
    
    // Test group by
    const [result4] = await pool.query('SELECT DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count FROM users GROUP BY DATE_FORMAT(created_at, "%Y-%m")');
    console.log('✅ Group by test:', result4);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

debugQuery();
