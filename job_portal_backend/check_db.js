// Simple script to check database connection and users
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'job_portal',
        connectionLimit: 10
    });

    try {
        console.log('Connecting to database...');
        
        // Check users table
        const [users] = await pool.execute('SELECT id, name, email, role, status FROM users LIMIT 10');
        console.log('\nUsers in database:');
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} - ${user.email} - ${user.role} - ${user.status}`);
        });
        
        console.log(`\nTotal users found: ${users.length}`);
        
    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        await pool.end();
    }
}

checkDatabase();
