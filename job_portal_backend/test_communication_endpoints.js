const axios = require('axios');

async function testCommunicationAPI() {
  try {
    console.log('Testing communication API endpoints...');
    
    // First, login as admin to get token
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');
    console.log('   Token length:', token.length);
    
    // Test announcements endpoints
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('2. Testing announcements stats endpoint...');
    try {
      const statsResponse = await axios.get('http://localhost:3001/api/communication/announcements/stats', { headers });
      console.log('✅ Announcements stats endpoint working');
      console.log('   Stats:', statsResponse.data);
    } catch (error) {
      console.log('❌ Announcements stats error:', error.response?.status, error.response?.data || error.message);
    }
    
    console.log('3. Testing get announcements endpoint...');
    try {
      const announcementsResponse = await axios.get('http://localhost:3001/api/communication/announcements?page=1&limit=10', { headers });
      console.log('✅ Get announcements endpoint working');
      console.log('   Announcements:', announcementsResponse.data);
    } catch (error) {
      console.log('❌ Get announcements error:', error.response?.status, error.response?.data || error.message);
    }
    
    console.log('4. Testing create announcement endpoint...');
    try {
      const createResponse = await axios.post('http://localhost:3001/api/communication/announcements', {
        title: 'Test Announcement',
        message: 'This is a test announcement',
        type: 'general',
        target_audience: 'all',
        send_methods: { email: true, in_app: true, push: false }
      }, { headers });
      console.log('✅ Create announcement endpoint working');
      console.log('   Created announcement:', createResponse.data);
    } catch (error) {
      console.log('❌ Create announcement error:', error.response?.status, error.response?.data || error.message);
    }
    
  } catch (error) {
    console.log('❌ Error during test:', error.response?.status, error.response?.data || error.message);
  }
}

testCommunicationAPI();
