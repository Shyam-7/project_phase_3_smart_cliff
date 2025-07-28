const axios = require('axios');

async function testUserNotifications() {
  try {
    console.log('Testing user notifications...');
    
    // Login as user
    console.log('1. Logging in as user...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'user@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ User login successful');
    
    // Test notifications endpoint
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('2. Testing user notifications endpoint...');
    try {
      const notificationsResponse = await axios.get('http://localhost:3001/api/communication/notifications?page=1&limit=10', { headers });
      console.log('✅ User notifications endpoint working');
      console.log('   Notifications count:', notificationsResponse.data.notifications.length);
      console.log('   Unread count:', notificationsResponse.data.unread);
      console.log('   Sample notification:', notificationsResponse.data.notifications[0]);
    } catch (error) {
      console.log('❌ User notifications error:', error.response?.status, error.response?.data || error.message);
    }
    
  } catch (error) {
    console.log('❌ Error during test:', error.response?.status, error.response?.data || error.message);
  }
}

testUserNotifications();
