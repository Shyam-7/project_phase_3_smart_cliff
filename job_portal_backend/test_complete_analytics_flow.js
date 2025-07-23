// test_complete_analytics_flow.js - Test login -> analytics flow
const fetch = require('node-fetch');

async function testCompleteAnalyticsFlow() {
  try {
    console.log('🔍 Testing complete analytics flow...');
    
    // Step 1: Login as admin
    console.log('\n1️⃣ Logging in as admin...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log(`❌ Login failed: ${loginResponse.status} - ${errorText}`);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful!');
    console.log(`🔑 Token received: ${loginData.token.substring(0, 50)}...`);
    console.log(`👤 User role: ${loginData.user.role}`);
    
    // Step 2: Access analytics endpoint with token
    console.log('\n2️⃣ Accessing analytics endpoint...');
    const analyticsResponse = await fetch('http://localhost:3001/api/analytics', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!analyticsResponse.ok) {
      const errorText = await analyticsResponse.text();
      console.log(`❌ Analytics request failed: ${analyticsResponse.status} - ${errorText}`);
      return;
    }
    
    const analyticsData = await analyticsResponse.json();
    console.log('✅ Analytics data retrieved successfully!');
    console.log('\n📊 Analytics Summary:');
    console.log(`   📈 Total Users: ${analyticsData.totalUsers}`);
    console.log(`   💼 Active Jobs: ${analyticsData.activeJobs}`);
    console.log(`   📝 Total Applications: ${analyticsData.totalApplications}`);
    console.log(`   🟢 Active Users: ${analyticsData.activeUsers}`);
    console.log(`   📂 Job Categories: ${analyticsData.jobCategories?.length || 0} categories`);
    console.log(`   📊 Application Statuses: ${analyticsData.applicationStatuses?.length || 0} statuses`);
    console.log(`   📅 Monthly Trends: ${analyticsData.monthlyTrends?.labels?.length || 0} months`);
    console.log(`   🎯 Conversion Funnel: ${analyticsData.conversionFunnel?.visits || 0} visits → ${analyticsData.conversionFunnel?.applications || 0} applications`);
    
    console.log('\n🎯 Sample Job Categories:');
    analyticsData.jobCategories?.forEach(cat => {
      console.log(`   - ${cat.name}: ${cat.count} jobs`);
    });
    
    console.log('\n📋 Application Status Breakdown:');
    analyticsData.applicationStatuses?.forEach(status => {
      console.log(`   - ${status.status}: ${status.count} (${status.percentage}%)`);
    });
    
    console.log('\n📈 Growth Metrics:');
    console.log(`   - User Growth: ${analyticsData.userGrowth}%`);
    console.log(`   - Job Growth: ${analyticsData.jobGrowth}%`);
    console.log(`   - Application Growth: ${analyticsData.applicationGrowth}%`);
    
    // Step 3: Test dashboard stats endpoint
    console.log('\n3️⃣ Testing dashboard stats...');
    const dashboardResponse = await fetch('http://localhost:3001/api/analytics/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json();
      console.log('✅ Dashboard stats retrieved!');
      console.log(`   📊 Dashboard Overview:`);
      console.log(`   - Users: ${dashboardData.totalUsers}`);
      console.log(`   - Applications: ${dashboardData.totalApplications}`);
      console.log(`   - Active Jobs: ${dashboardData.activeJobs}`);
    } else {
      console.log('❌ Dashboard stats failed');
    }
    
    console.log('\n🎉 Complete analytics flow test SUCCESSFUL!');
    console.log('\n💡 Next steps for frontend:');
    console.log('   1. Ensure user is logged in as admin');
    console.log('   2. Token should be stored in localStorage as "authToken"');
    console.log('   3. Analytics service will automatically use the token');
    console.log('   4. Frontend should handle token expiry and re-login');
    
  } catch (error) {
    console.error('❌ Error in complete analytics flow:', error.message);
  } finally {
    process.exit(0);
  }
}

testCompleteAnalyticsFlow();
