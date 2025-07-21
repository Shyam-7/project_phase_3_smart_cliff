const pool = require('./db');
const bcrypt = require('bcryptjs');

async function fixPasswords() {
  try {
    // Hash the password "123456"
    const hashedPassword = await bcrypt.hash('123456', 10);
    console.log('Generated hash for 123456:', hashedPassword);
    
    // Update all users with the correct hash
    const [result] = await pool.query(
      'UPDATE users SET password_hash = ? WHERE email IN (?, ?, ?, ?)',
      [hashedPassword, 'admin@example.com', 'user@example.com', 'justsgk07@gmail.com', 'employer@example.com']
    );
    
    console.log('Updated passwords for', result.affectedRows, 'users');
    
    // Test the login
    const [users] = await pool.query('SELECT id, email, password_hash FROM users WHERE email = ?', ['user@example.com']);
    console.log('User found:', users[0]);
    
    if (users[0]) {
      const isValid = await bcrypt.compare('123456', users[0].password_hash);
      console.log('Password validation test:', isValid);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error fixing passwords:', error);
    process.exit(1);
  }
}

fixPasswords();
