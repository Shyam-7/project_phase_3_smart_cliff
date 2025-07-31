const pool = require('./db');

(async () => {
  try {
    console.log('=== ANALYTICS INTEGRATION TEST ===');
    console.log('Date:', new Date().toISOString());
    
    console.log('\n1. DATABASE COUNTS:');
    const [jobs] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_status,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_status,
        COUNT(CASE WHEN expires_at > NOW() OR expires_at IS NULL THEN 1 END) as not_expired
      FROM jobs
    `);
    
    const [apps] = await pool.query('SELECT COUNT(*) as total FROM applications');
    const [users] = await pool.query('SELECT COUNT(*) as total FROM users');
    
    console.log('📊 Database Reality:');
    console.log('  Jobs - Total:', jobs[0].total);
    console.log('  Jobs - Active Status:', jobs[0].active_status);
    console.log('  Jobs - Inactive Status:', jobs[0].inactive_status);
    console.log('  Jobs - Not Expired:', jobs[0].not_expired);
    console.log('  Applications:', apps[0].total);
    console.log('  Users:', users[0].total);
    
    console.log('\n2. ANALYTICS API RESPONSE:');
    const analyticsController = require('./api/controllers/analyticsController');
    const mockReq = {};
    let analyticsResult = null;
    const mockRes = { 
      json: (data) => { 
        analyticsResult = data;
        console.log('📈 Analytics API Result:');
        console.log('  Total Users:', data.data.totalUsers);
        console.log('  Active Jobs:', data.data.activeJobs);
        console.log('  Total Applications:', data.data.totalApplications);
        console.log('  User Visits:', data.data.userVisits);
        console.log('  User Growth:', data.data.userGrowth + '%');
        console.log('  Job Growth:', data.data.jobGrowth + '%');
        console.log('  Application Growth:', data.data.applicationGrowth + '%');
        console.log('  Visit Growth:', data.data.visitGrowth + '%');
      }
    };
    
    await analyticsController.getAnalyticsOverview(mockReq, mockRes);
    
    console.log('\n3. VERIFICATION:');
    const dbActive = jobs[0].active_status;
    const apiActive = analyticsResult.data.activeJobs;
    const activeMatch = dbActive === apiActive;
    
    console.log('✅ Active Jobs Match:', activeMatch, `(DB: ${dbActive}, API: ${apiActive})`);
    console.log('✅ Users Match:', users[0].total === analyticsResult.data.totalUsers);
    console.log('✅ Applications Match:', apps[0].total === analyticsResult.data.totalApplications);
    
    console.log('\n4. ADMIN JOBS API TEST:');
    const jobController = require('./api/controllers/jobController');
    let adminJobsResult = null;
    const mockAdminRes = {
      json: (data) => {
        adminJobsResult = data;
        console.log('📋 Admin Jobs API Result:');
        console.log('  Total Jobs Returned:', data.length);
        
        const activeJobs = data.filter(job => job.status === 'active').length;
        const inactiveJobs = data.filter(job => job.status === 'inactive').length;
        
        console.log('  Active Jobs in Response:', activeJobs);
        console.log('  Inactive Jobs in Response:', inactiveJobs);
        console.log('  Status Breakdown:', data.reduce((acc, job) => {
          acc[job.status] = (acc[job.status] || 0) + 1;
          return acc;
        }, {}));
      }
    };
    
    await jobController.getAllJobsForAdmin({ query: {} }, mockAdminRes);
    
    console.log('\n5. FINAL VERIFICATION:');
    const adminActiveCount = adminJobsResult ? adminJobsResult.filter(job => job.status === 'active').length : 0;
    console.log('🎯 All Systems Synchronized:', 
      dbActive === apiActive && 
      dbActive === adminActiveCount
    );
    
    console.log('\n📊 SUMMARY:');
    console.log('  Database Active Jobs:', dbActive);
    console.log('  Analytics API Active Jobs:', apiActive);
    console.log('  Admin Jobs API Active Count:', adminActiveCount);
    console.log('  All Match:', dbActive === apiActive && dbActive === adminActiveCount ? '✅ YES' : '❌ NO');
    
  } catch (err) {
    console.error('❌ Test Error:', err);
  }
  process.exit();
})();
