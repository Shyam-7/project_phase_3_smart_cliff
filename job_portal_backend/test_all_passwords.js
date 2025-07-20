const pool = require('./db');
const bcrypt = require('bcryptjs');

async function testAllUserPasswords() {
  try {
    console.log('🔐 Testing all user passwords...\n');
    
    // Get all users from database
    const [users] = await pool.query('SELECT id, name, email, role, password_hash FROM users ORDER BY role, email');
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log(`Found ${users.length} users in database:\n`);
    
    // Common passwords to test
    const commonPasswords = ['password', 'admin123', '123456', 'admin', 'test123'];
    
    for (const user of users) {
      console.log(`👤 User: ${user.name} (${user.email}) - Role: ${user.role}`);
      
      let passwordFound = false;
      
      // Test common passwords
      for (const testPassword of commonPasswords) {
        const match = await bcrypt.compare(testPassword, user.password_hash);
        if (match) {
          console.log(`   ✅ Password: "${testPassword}"`);
          passwordFound = true;
          break;
        }
      }
      
      if (!passwordFound) {
        console.log(`   ❓ Password not found among common passwords`);
        console.log(`   🔑 Hash: ${user.password_hash.substring(0, 30)}...`);
      }
      
      console.log(''); // Empty line for readability
    }
    
    console.log('='.repeat(50));
    console.log('📋 SUMMARY - Working Login Credentials:');
    console.log('='.repeat(50));
    
    // Re-test and display working credentials
    for (const user of users) {
      for (const testPassword of commonPasswords) {
        const match = await bcrypt.compare(testPassword, user.password_hash);
        if (match) {
          console.log(`Email: ${user.email} | Password: ${testPassword} | Role: ${user.role}`);
          break;
        }
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing passwords:', error);
    process.exit(1);
  }
}

testAllUserPasswords();
