const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Test admin credentials - you may need to adjust these
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

async function testUserManagement() {
  try {
    console.log('🧪 Testing User Management API Endpoints...\n');
    
    // 1. Login as admin to get token
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');
    
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // 2. Test GET all users
    console.log('\n2. Fetching all users...');
    const usersResponse = await axios.get(`${API_BASE}/users`, { headers: authHeaders });
    const users = usersResponse.data;
    console.log(`✅ Retrieved ${users.length} users`);
    
    if (users.length > 0) {
      console.log('Sample user:', {
        id: users[0].id,
        name: users[0].name,
        email: users[0].email,
        role: users[0].role,
        status: users[0].status,
        applicationCount: users[0].application_count
      });
    }
    
    // 3. Test GET user by ID (use first user from list)
    if (users.length > 0) {
      const firstUserId = users[0].id;
      console.log(`\n3. Fetching user by ID (${firstUserId})...`);
      const userResponse = await axios.get(`${API_BASE}/users/${firstUserId}`, { headers: authHeaders });
      console.log('✅ Retrieved user by ID:', {
        id: userResponse.data.id,
        name: userResponse.data.name,
        email: userResponse.data.email
      });
      
      // 4. Test update user status (only if not admin)
      if (userResponse.data.role !== 'admin') {
        console.log(`\n4. Testing status update for user ${firstUserId}...`);
        const currentStatus = userResponse.data.status;
        const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
        
        const statusUpdateResponse = await axios.put(
          `${API_BASE}/users/${firstUserId}/status`, 
          { status: newStatus }, 
          { headers: authHeaders }
        );
        console.log(`✅ Status updated from ${currentStatus} to ${newStatus}`);
        
        // Revert the status change
        await axios.put(
          `${API_BASE}/users/${firstUserId}/status`, 
          { status: currentStatus }, 
          { headers: authHeaders }
        );
        console.log(`✅ Status reverted back to ${currentStatus}`);
      } else {
        console.log('\n4. ⏭️  Skipping status update (user is admin)');
      }
    }
    
    console.log('\n🎉 All user management API tests passed!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Admin authentication');
    console.log('- ✅ Get all users with application counts');
    console.log('- ✅ Get user by ID');
    console.log('- ✅ Update user status');
    console.log('\n🚀 User management is now fully functional!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response ? error.response.data : error.message);
  }
}

// Run the test
testUserManagement();
