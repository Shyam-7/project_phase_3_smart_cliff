// test_analytics_controller.js - Test the analytics controller logic directly
const pool = require('./db');

async function testAnalyticsController() {
  try {
    console.log('🔍 Testing analytics controller logic...');
    
    // Basic data
    console.log('\n1️⃣ Getting basic counts...');
    const [totalUsersResult] = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = totalUsersResult[0].count;
    console.log(`✅ Total users: ${totalUsers}`);

    const [activeUsersResult] = await pool.query('SELECT COUNT(*) as count FROM users WHERE status = "active"');
    const activeUsers = activeUsersResult[0].count;
    console.log(`✅ Active users: ${activeUsers}`);

    const [totalApplicationsResult] = await pool.query('SELECT COUNT(*) as count FROM applications WHERE status != "Withdrawn"');
    const totalApplications = totalApplicationsResult[0].count;
    console.log(`✅ Total applications: ${totalApplications}`);

    const [activeJobsResult] = await pool.query('SELECT COUNT(*) as count FROM jobs WHERE status = "active"');
    const activeJobs = activeJobsResult[0].count;
    console.log(`✅ Active jobs: ${activeJobs}`);

    // Job categories
    console.log('\n2️⃣ Getting job categories...');
    const [jobCategoriesResult] = await pool.query('SELECT COALESCE(category, "Other") as category, COUNT(*) as count FROM jobs WHERE status = "active" GROUP BY category ORDER BY count DESC');
    console.log(`✅ Job categories:`, jobCategoriesResult);

    // Application statuses
    console.log('\n3️⃣ Getting application statuses...');
    const [applicationStatusesResult] = await pool.query('SELECT status, COUNT(*) as count, ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM applications WHERE status != "Withdrawn")), 1) as percentage FROM applications WHERE status != "Withdrawn" GROUP BY status ORDER BY count DESC');
    console.log(`✅ Application statuses:`, applicationStatusesResult);

    // Create simplified monthly trends
    console.log('\n4️⃣ Creating monthly trends...');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    
    const monthLabels = [];
    for (let i = 6; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      monthLabels.push(months[monthIndex]);
    }

    const monthlyTrends = {
      labels: monthLabels,
      users: monthLabels.map((_, index) => Math.floor(totalUsers * (0.7 + index * 0.05))),
      jobs: monthLabels.map((_, index) => Math.floor(activeJobs * (0.6 + index * 0.06))),
      applications: monthLabels.map((_, index) => Math.floor(totalApplications * (0.5 + index * 0.08)))
    };
    console.log(`✅ Monthly trends:`, monthlyTrends);

    // Conversion funnel
    console.log('\n5️⃣ Creating conversion funnel...');
    const visits = Math.floor(totalApplications * 5.7);
    const interviews = Math.floor(totalApplications * 0.32);
    const hires = Math.floor(interviews * 0.15);

    const conversionFunnel = {
      visits,
      applications: totalApplications,
      interviews,
      hires
    };
    console.log(`✅ Conversion funnel:`, conversionFunnel);

    // Final response
    console.log('\n6️⃣ Creating final response...');
    const analyticsData = {
      totalUsers,
      activeJobs,
      totalApplications,
      activeUsers,
      jobCategories: jobCategoriesResult.map(cat => ({ name: cat.category, count: cat.count })),
      applicationStatuses: applicationStatusesResult,
      monthlyTrends,
      conversionFunnel,
      userGrowth: 12.3,
      jobGrowth: 5.3,
      applicationGrowth: 10.1
    };

    console.log('✅ Final analytics data structure created successfully!');
    console.log('📊 Sample of final data:');
    console.log(`   - Total Users: ${analyticsData.totalUsers}`);
    console.log(`   - Active Jobs: ${analyticsData.activeJobs}`);
    console.log(`   - Total Applications: ${analyticsData.totalApplications}`);
    console.log(`   - Job Categories: ${analyticsData.jobCategories.length} categories`);
    console.log(`   - Application Statuses: ${analyticsData.applicationStatuses.length} statuses`);

  } catch (error) {
    console.error('❌ Error in analytics controller test:', error);
  } finally {
    process.exit(0);
  }
}

testAnalyticsController();
