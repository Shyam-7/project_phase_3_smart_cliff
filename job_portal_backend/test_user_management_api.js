const axios = require('axios');

async function testUserManagement() {
  try {
    console.log('Testing user management API...');
    
    // First, login as admin to get the token
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');
    
    // Test getting all users
    const usersResponse = await axios.get('http://localhost:3001/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Users fetched successfully:', usersResponse.data.length, 'users found');
    console.log('Users:', usersResponse.data.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
    
    // Find a non-admin user to test with
    const nonAdminUser = usersResponse.data.find(user => user.role !== 'admin');
    
    if (nonAdminUser) {
      console.log('Testing with user:', nonAdminUser.name, '(', nonAdminUser.role, ')');
      
      // Test getting user by ID
      const userByIdResponse = await axios.get(`http://localhost:3001/api/users/${nonAdminUser.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ User by ID fetched successfully:', userByIdResponse.data.name);
      
      // Test updating user status
      const updateStatusResponse = await axios.patch(`http://localhost:3001/api/users/${nonAdminUser.id}/status`, 
        { status: 'inactive' }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ User status updated successfully:', updateStatusResponse.data.message);
      
      // Revert status back
      await axios.patch(`http://localhost:3001/api/users/${nonAdminUser.id}/status`, 
        { status: 'active' }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ User status reverted to active');
      
    } else {
      console.log('⚠️ No non-admin user found to test with');
    }
    
    console.log('🎉 All user management operations working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing user management API:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
  }
}

testUserManagement();
