const axios = require('axios');

async function testUserLogin() {
  const baseURL = 'http://localhost:3001/api';
  
  try {
    console.log('Testing user login and notification access...\n');

    // Test 1: Login as user
    console.log('1. Logging in as user...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'user@example.com',
      password: 'password123' // Use the actual password for this user
    });
    
    if (loginResponse.data.token) {
      const token = loginResponse.data.token;
      console.log('✅ User login successful');
      console.log('   Token received:', token.substring(0, 50) + '...');
      console.log('   Token length:', token.length);
      console.log('   User data:', loginResponse.data.user);

      // Test 2: Access notifications endpoint
      console.log('\n2. Accessing notifications endpoint...');
      
      const authHeader = `Bearer ${token}`;
      console.log('   Authorization header:', authHeader.substring(0, 70) + '...');
      
      const notificationsResponse = await axios.get(`${baseURL}/communication/notifications`, {
        headers: { 
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      });
      
      if (notificationsResponse.data.success) {
        console.log('✅ Notifications accessed successfully');
        console.log('   Notifications count:', notificationsResponse.data.notifications.length);
        console.log('   Unread count:', notificationsResponse.data.unread);
      } else {
        console.log('❌ Failed to access notifications:', notificationsResponse.data.message);
      }

    } else {
      console.log('❌ Login failed - no token received');
      console.log('   Response:', loginResponse.data);
    }

  } catch (error) {
    console.error('❌ Error during test:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
      console.error('   Headers:', error.response.headers);
    } else {
      console.error('   Message:', error.message);
    }
  }
}

testUserLogin();
