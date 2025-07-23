// test_analytics_auth.js - Generate admin token and test analytics endpoint
const jwt = require('jsonwebtoken');
const pool = require('./db');

async function testAnalyticsWithAuth() {
  try {
    console.log('Testing analytics endpoint with authentication...');
    
    // Get admin user from database
    const [adminUsers] = await pool.query(
      'SELECT id, email, role FROM users WHERE role = "admin" LIMIT 1'
    );
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin user found in database');
      return;
    }
    
    const adminUser = adminUsers[0];
    console.log(`✅ Found admin user: ${adminUser.email}`);
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: adminUser.id, 
        email: adminUser.email, 
        role: adminUser.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log(`✅ Generated JWT token for admin`);
    console.log(`🔑 Token: ${token}`);
    
    // Test the analytics endpoint
    const fetch = require('node-fetch');
    
    try {
      const response = await fetch('http://localhost:3001/api/analytics', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Analytics endpoint successful!');
        console.log('📊 Sample data:');
        console.log(`   Total Users: ${data.totalUsers}`);
        console.log(`   Active Jobs: ${data.activeJobs}`);
        console.log(`   Total Applications: ${data.totalApplications}`);
        console.log(`   Job Categories: ${data.jobCategories?.length || 0} categories`);
      } else {
        const errorText = await response.text();
        console.log(`❌ Analytics endpoint failed: ${response.status} - ${errorText}`);
      }
    } catch (fetchError) {
      console.log(`❌ Fetch error: ${fetchError.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing analytics:', error);
  } finally {
    process.exit(0);
  }
}

// Install node-fetch if needed
try {
  require('node-fetch');
  testAnalyticsWithAuth();
} catch (error) {
  console.log('📦 Installing node-fetch...');
  const { exec } = require('child_process');
  exec('npm install node-fetch@2', (err, stdout, stderr) => {
    if (err) {
      console.log('❌ Failed to install node-fetch:', err.message);
      console.log('💡 Please run: npm install node-fetch@2');
      process.exit(1);
    } else {
      console.log('✅ node-fetch installed');
      testAnalyticsWithAuth();
    }
  });
}
