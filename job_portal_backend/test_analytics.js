const pool = require('./db');

(async () => {
  try {
    console.log('=== MONTHLY DATA ANALYSIS ===');
    
    const [jobsByMonth] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count 
      FROM jobs 
      GROUP BY month 
      ORDER BY month
    `);
    console.log('Jobs by month:', jobsByMonth);
    
    const [appsByMonth] = await pool.query(`
      SELECT DATE_FORMAT(applied_at, '%Y-%m') as month, COUNT(*) as count 
      FROM applications 
      GROUP BY month 
      ORDER BY month
    `);
    console.log('Applications by month:', appsByMonth);
    
    const [usersByMonth] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count 
      FROM users 
      GROUP BY month 
      ORDER BY month
    `);
    console.log('Users by month:', usersByMonth);
    
    // Test current month vs last month calculation
    const currentMonth = new Date();
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    console.log('\n=== GROWTH CALCULATION TEST ===');
    console.log('Current Month Start:', currentMonthStart);
    console.log('Last Month Start:', lastMonth);
    
    // Current month jobs
    const [currentMonthJobs] = await pool.query(
      'SELECT COUNT(*) as total FROM jobs WHERE created_at >= ?', 
      [currentMonthStart]
    );
    console.log('Current month jobs:', currentMonthJobs[0].total);
    
    // Last month jobs
    const [lastMonthJobs] = await pool.query(
      'SELECT COUNT(*) as total FROM jobs WHERE created_at >= ? AND created_at < ?', 
      [lastMonth, currentMonthStart]
    );
    console.log('Last month jobs:', lastMonthJobs[0].total);
    
    const jobGrowth = lastMonthJobs[0].total > 0 ? 
      ((currentMonthJobs[0].total - lastMonthJobs[0].total) / lastMonthJobs[0].total) * 100 : 
      currentMonthJobs[0].total > 0 ? 100 : 0; // If no last month data, show 100% if current has data
    
    console.log('Calculated job growth:', jobGrowth + '%');
    
  } catch (err) {
    console.error(err);
  }
  process.exit();
})();
