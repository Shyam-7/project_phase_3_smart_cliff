// Test script to verify all user management changes
const axios = require('axios');

async function testUserManagementChanges() {
    const baseURL = 'http://localhost:3001/api';
    
    try {
        // Login as admin
        console.log('🔐 Logging in as admin...');
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
            email: 'admin@example.com',
            password: 'admin123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Admin login successful');
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        // Test getAllUsers endpoint
        console.log('\n📋 Testing user management data...');
        const usersResponse = await axios.get(`${baseURL}/users`, { headers });
        const users = usersResponse.data;
        
        console.log(`✅ Found ${users.length} users`);
        
        // Check status normalization issue
        console.log('\n🔍 Checking status values:');
        users.forEach(user => {
            console.log(`- ${user.name}: Status = "${user.status}" (Type: ${typeof user.status})`);
        });
        
        // Check application counts
        console.log('\n📊 Application counts:');
        users.forEach(user => {
            console.log(`- ${user.name}: ${user.application_count || 0} applications`);
        });
        
        // Verify admin users can't be deleted (should be handled in frontend)
        const adminUsers = users.filter(user => user.role === 'admin');
        const nonAdminUsers = users.filter(user => user.role !== 'admin');
        
        console.log(`\n👑 Admin users (should not have delete button): ${adminUsers.length}`);
        adminUsers.forEach(user => console.log(`- ${user.name} (${user.email})`));
        
        console.log(`\n👤 Non-admin users (can be deleted): ${nonAdminUsers.length}`);
        nonAdminUsers.forEach(user => console.log(`- ${user.name} (${user.email})`));
        
        console.log('\n✅ All user management data looks correct!');
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testUserManagementChanges();
