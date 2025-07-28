const pool = require('./db');
const bcrypt = require('bcryptjs');

async function updateUserPassword() {
  try {
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Generated hash:', hashedPassword);
    console.log('Hash length:', hashedPassword.length);
    
    const [result] = await pool.query(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [hashedPassword, 'user@example.com']
    );
    
    console.log('Update result:', result);
    
    // Verify the update
    const [rows] = await pool.query('SELECT email, password_hash FROM users WHERE email = ?', ['user@example.com']);
    const user = rows[0];
    
    console.log('Stored hash:', user.password_hash);
    console.log('Stored hash length:', user.password_hash.length);
    
    // Test verification
    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log('Password verification:', isValid);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

updateUserPassword();
