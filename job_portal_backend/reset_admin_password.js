const pool = require('./db');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  try {
    console.log('Resetting admin password...');
    
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const [result] = await pool.query(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [hashedPassword, 'admin@example.com']
    );
    
    if (result.affectedRows > 0) {
      console.log('✅ Admin password updated successfully!');
      console.log('New credentials:');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
    } else {
      console.log('❌ No admin user found to update');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating password:', error);
    process.exit(1);
  }
}

resetAdminPassword();
