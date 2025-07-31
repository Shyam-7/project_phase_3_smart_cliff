const axios = require('axios');

const baseURL = 'http://localhost:3001/api';

// Test login first to get a token
async function testCommunicationAPI() {
  try {
    console.log('🔐 Testing admin login...');
    
    // Login as admin
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@example.com',
      password: '123456'
    });
    
    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    console.log('✅ Admin login successful');
    const token = loginResponse.data.token;
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test get announcements
    console.log('\n📢 Testing get announcements...');
    try {
      const announcementsResponse = await axios.get(`${baseURL}/communication/announcements`, { headers });
      console.log('✅ Get announcements successful:', announcementsResponse.data);
    } catch (error) {
      console.error('❌ Get announcements failed:', error.response?.data || error.message);
    }
    
    // Test get scheduled announcements
    console.log('\n⏰ Testing get scheduled announcements...');
    try {
      const scheduledResponse = await axios.get(`${baseURL}/communication/announcements/scheduled`, { headers });
      console.log('✅ Get scheduled announcements successful:', scheduledResponse.data);
    } catch (error) {
      console.error('❌ Get scheduled announcements failed:', error.response?.data || error.message);
    }
    
    // Test create announcement
    console.log('\n➕ Testing create announcement...');
    try {
      const createResponse = await axios.post(`${baseURL}/communication/announcements`, {
        title: 'Test Announcement',
        message: 'This is a test announcement message',
        target_audience: 'all',
        type: 'general'
      }, { headers });
      console.log('✅ Create announcement successful:', createResponse.data);
    } catch (error) {
      console.error('❌ Create announcement failed:', error.response?.data || error.message);
    }
    
    // Test get notifications
    console.log('\n🔔 Testing get user notifications...');
    try {
      const notificationsResponse = await axios.get(`${baseURL}/communication/notifications`, { headers });
      console.log('✅ Get notifications successful:', notificationsResponse.data);
    } catch (error) {
      console.error('❌ Get notifications failed:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testCommunicationAPI();
