const axios = require('axios');

async function testCommunicationAPI() {
  const baseURL = 'http://localhost:3001/api';
  
  try {
    console.log('Testing Communication API...\n');

    // Test 1: Login as admin to get token
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    if (loginResponse.data.success) {
      const token = loginResponse.data.token;
      console.log('✅ Admin login successful');

      // Test 2: Get announcement stats
      console.log('\n2. Getting announcement stats...');
      const statsResponse = await axios.get(`${baseURL}/communication/announcements/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (statsResponse.data.success) {
        console.log('✅ Stats retrieved:', statsResponse.data.stats);
      } else {
        console.log('❌ Failed to get stats:', statsResponse.data.message);
      }

      // Test 3: Get all announcements
      console.log('\n3. Getting all announcements...');
      const announcementsResponse = await axios.get(`${baseURL}/communication/announcements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (announcementsResponse.data.success) {
        console.log(`✅ Retrieved ${announcementsResponse.data.announcements.length} announcements`);
      } else {
        console.log('❌ Failed to get announcements:', announcementsResponse.data.message);
      }

      // Test 4: Create a new announcement
      console.log('\n4. Creating new announcement...');
      const newAnnouncement = {
        title: 'Test Announcement',
        message: 'This is a test announcement created via API',
        type: 'general',
        target_audience: 'all',
        send_methods: {
          email: false,
          in_app: true,
          push: false
        }
      };

      const createResponse = await axios.post(`${baseURL}/communication/announcements`, newAnnouncement, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (createResponse.data.success) {
        console.log('✅ Announcement created successfully');
      } else {
        console.log('❌ Failed to create announcement:', createResponse.data.message);
      }

    } else {
      console.log('❌ Admin login failed:', loginResponse.data.message);
      return;
    }

    // Test 5: Login as regular user to test notifications
    console.log('\n5. Testing user notifications...');
    
    // First, let's get a regular user
    const userLoginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'user1@example.com',
      password: 'password123'
    });
    
    if (userLoginResponse.data.success) {
      const userToken = userLoginResponse.data.token;
      console.log('✅ User login successful');

      // Get user notifications
      const notificationsResponse = await axios.get(`${baseURL}/communication/notifications`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      if (notificationsResponse.data.success) {
        console.log(`✅ Retrieved ${notificationsResponse.data.notifications.length} notifications`);
        console.log(`📬 Unread notifications: ${notificationsResponse.data.unread}`);
        
        // If there are notifications, mark the first one as read
        if (notificationsResponse.data.notifications.length > 0) {
          const firstNotification = notificationsResponse.data.notifications[0];
          console.log(`\n6. Marking notification "${firstNotification.title}" as read...`);
          
          const markReadResponse = await axios.put(
            `${baseURL}/communication/notifications/${firstNotification.id}/read`, 
            {}, 
            { headers: { Authorization: `Bearer ${userToken}` } }
          );
          
          if (markReadResponse.data.success) {
            console.log('✅ Notification marked as read');
          } else {
            console.log('❌ Failed to mark notification as read:', markReadResponse.data.message);
          }
        }
      } else {
        console.log('❌ Failed to get notifications:', notificationsResponse.data.message);
      }
    } else {
      console.log('❌ User login failed, skipping notification tests');
    }

    console.log('\n🎉 Communication API testing completed!');

  } catch (error) {
    console.error('❌ Error testing API:', error.response?.data || error.message);
  }
}

testCommunicationAPI();
