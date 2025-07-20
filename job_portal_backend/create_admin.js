const pool = require('./db');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    console.log('Creating admin account...');
    
    const adminEmail = 'admin@skillhunt.com';
    const adminPassword = 'admin123';
    const adminName = 'Admin User';
    
    // Check if admin already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [adminEmail]);
    if (existing.length > 0) {
      console.log('Admin account already exists with email:', adminEmail);
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Create admin user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [adminName, adminEmail, hashedPassword, 'admin']
    );
    
    console.log('✅ Admin account created successfully!');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('User ID:', result.insertId);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
