const pool = require('./db');
const bcrypt = require('bcryptjs');

async function changeUserPassword() {
  try {
    // Configure these values
    const userEmail = process.argv[2] || 'admin@example.com';
    const newPassword = process.argv[3] || 'newpassword123';
    
    if (!userEmail || !newPassword) {
      console.log('Usage: node change_password.js <email> <new_password>');
      console.log('Example: node change_password.js admin@example.com mynewpassword');
      process.exit(1);
    }
    
    console.log(`Changing password for: ${userEmail}`);
    
    // Check if user exists
    const [users] = await pool.query('SELECT id, name FROM users WHERE email = ?', [userEmail]);
    
    if (users.length === 0) {
      console.log('❌ User not found with email:', userEmail);
      process.exit(1);
    }
    
    const user = users[0];
    console.log(`Found user: ${user.name} (ID: ${user.id})`);
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    const [result] = await pool.query(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [hashedPassword, userEmail]
    );
    
    if (result.affectedRows > 0) {
      console.log('✅ Password updated successfully!');
      console.log(`New password for ${userEmail}: ${newPassword}`);
    } else {
      console.log('❌ Failed to update password');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error changing password:', error);
    process.exit(1);
  }
}

changeUserPassword();
