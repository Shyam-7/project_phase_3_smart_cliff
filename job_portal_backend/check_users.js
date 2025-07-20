const pool = require('./db');

async function checkUsers() {
  try {
    console.log('Checking users in database...');
    const [rows] = await pool.query('SELECT id, name, email, role FROM users ORDER BY id');
    
    console.log('\n=== USERS IN DATABASE ===');
    rows.forEach(user => {
      console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
    });
    
    console.log(`\nTotal users: ${rows.length}`);
    
    // Check specifically for admin users
    const [adminRows] = await pool.query('SELECT id, name, email, role FROM users WHERE role = "admin"');
    console.log(`\nAdmin users: ${adminRows.length}`);
    adminRows.forEach(admin => {
      console.log(`Admin - ID: ${admin.id}, Name: ${admin.name}, Email: ${admin.email}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking users:', error);
    process.exit(1);
  }
}

checkUsers();
