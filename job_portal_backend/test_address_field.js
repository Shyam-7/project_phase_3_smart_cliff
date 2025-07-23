// test_address_field.js - Test script to verify address field functionality
const express = require('express');
const pool = require('./db');

async function testAddressField() {
  try {
    console.log('Testing address field in user management...');
    
    // First, let's add the address column if it doesn't exist
    try {
      await pool.query('ALTER TABLE users ADD COLUMN address TEXT AFTER status');
      console.log('✅ Address column added successfully');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Address column already exists');
      } else {
        console.log('⚠️  Error adding address column:', error.message);
      }
    }
    
    // Update some sample users with address data
    const addressUpdates = [
      { email: 'admin@jobportal.com', address: '123 Admin Street, Tech City, Karnataka, India - 560001' },
      { email: 'john.doe@example.com', address: '456 Developer Avenue, Bangalore, Karnataka, India - 560002' },
      { email: 'jane.smith@example.com', address: '789 Manager Road, Mumbai, Maharashtra, India - 400001' },
      { email: 'testuser@example.com', address: '321 User Lane, Hyderabad, Telangana, India - 500001' }
    ];
    
    for (const update of addressUpdates) {
      try {
        const [result] = await pool.query(
          'UPDATE users SET address = ? WHERE email = ?',
          [update.address, update.email]
        );
        if (result.affectedRows > 0) {
          console.log(`✅ Updated address for ${update.email}`);
        } else {
          console.log(`⚠️  User ${update.email} not found`);
        }
      } catch (error) {
        console.log(`❌ Error updating ${update.email}:`, error.message);
      }
    }
    
    // Test the getAllUsers query with address field
    console.log('\nTesting getAllUsers query with address field...');
    const [users] = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.status, u.created_at, u.address,
             p.phone_number, p.bio, p.skills, p.location,
             COUNT(a.id) as application_count
      FROM users u
      LEFT JOIN job_seeker_profiles p ON u.id = p.user_id
      LEFT JOIN applications a ON u.id = a.user_id AND a.status != 'Withdrawn'
      GROUP BY u.id, u.name, u.email, u.role, u.status, u.created_at, u.address, p.phone_number, p.bio, p.skills, p.location
      ORDER BY u.created_at DESC
      LIMIT 3
    `);
    
    console.log('\nSample users with address data:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Address: ${user.address || 'No address provided'}`);
      console.log(`   Role: ${user.role}, Status: ${user.status}`);
      console.log(`   Applications: ${user.application_count}`);
      console.log('');
    });
    
    console.log('✅ Address field test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing address field:', error);
  } finally {
    process.exit(0);
  }
}

// Run the test
testAddressField();
