const pool = require('./db');
const bcrypt = require('bcryptjs');

async function checkAdminPassword() {
  try {
    console.log('Checking admin password...');
    
    const [rows] = await pool.query('SELECT password_hash FROM users WHERE email = ?', ['admin@example.com']);
    
    if (rows.length === 0) {
      console.log('No admin found with email admin@example.com');
      return;
    }
    
    const storedHash = rows[0].password_hash;
    console.log('Stored password hash:', storedHash);
    
    // Test common passwords
    const testPasswords = ['admin', 'admin123', 'password', 'test123', 'admin@123'];
    
    for (const password of testPasswords) {
      const match = await bcrypt.compare(password, storedHash);
      console.log(`Password "${password}": ${match ? '✅ MATCH' : '❌ No match'}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAdminPassword();
