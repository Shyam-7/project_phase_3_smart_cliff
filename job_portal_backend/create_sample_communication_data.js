const pool = require('./db');

async function createSampleData() {
  try {
    console.log('Creating sample announcement and notification data...');
    
    // First, let's get a user ID to use as the creator
    const [users] = await pool.execute('SELECT id FROM users WHERE role = "admin" LIMIT 1');
    
    if (users.length === 0) {
      console.log('No admin users found. Creating sample admin user...');
      
      // Create a sample admin user
      const [adminResult] = await pool.execute(
        `INSERT INTO users (id, name, email, password_hash, role, status) 
         VALUES (UUID(), 'Admin User', 'admin@example.com', '$2b$10$hash', 'admin', 'active')`
      );
      
      // Get the created admin user
      const [newUsers] = await pool.execute('SELECT id FROM users WHERE email = "admin@example.com"');
      var adminUserId = newUsers[0].id;
    } else {
      var adminUserId = users[0].id;
    }

    console.log('Using admin user ID:', adminUserId);

    // Create sample announcements
    const announcements = [
      {
        title: 'Welcome to the Job Portal!',
        message: 'We are excited to welcome you to our new job portal platform. Discover thousands of job opportunities and connect with top employers.',
        type: 'general',
        target_audience: 'all',
        send_methods: JSON.stringify({ email: true, in_app: true, push: false }),
        status: 'sent',
        created_by: adminUserId
      },
      {
        title: 'Platform Maintenance Scheduled',
        message: 'We will be performing routine maintenance on our platform this weekend from 2 AM to 6 AM. During this time, some features may be temporarily unavailable.',
        type: 'maintenance',
        target_audience: 'all',
        send_methods: JSON.stringify({ email: true, in_app: true, push: true }),
        status: 'scheduled',
        scheduled_at: '2025-01-15 02:00:00',
        created_by: adminUserId
      },
      {
        title: 'New Feature: AI-Powered Job Matching',
        message: 'Introducing our new AI-powered job matching feature! Get personalized job recommendations based on your skills, experience, and preferences.',
        type: 'feature',
        target_audience: 'job-seekers',
        send_methods: JSON.stringify({ email: false, in_app: true, push: false }),
        status: 'sent',
        created_by: adminUserId
      },
      {
        title: 'Security Alert: Update Your Password',
        message: 'As part of our ongoing security improvements, we recommend all users update their passwords. Use a strong, unique password to keep your account secure.',
        type: 'urgent',
        target_audience: 'all',
        send_methods: JSON.stringify({ email: true, in_app: true, push: true }),
        status: 'sent',
        created_by: adminUserId
      }
    ];

    // Insert announcements
    for (const announcement of announcements) {
      const [result] = await pool.execute(
        `INSERT INTO announcements (title, message, type, target_audience, send_methods, status, scheduled_at, created_by, sent_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          announcement.title,
          announcement.message,
          announcement.type,
          announcement.target_audience,
          announcement.send_methods,
          announcement.status,
          announcement.scheduled_at || null,
          announcement.created_by,
          announcement.status === 'sent' ? new Date() : null
        ]
      );
      
      const announcementId = result.insertId;
      console.log(`Created announcement: ${announcement.title} (ID: ${announcementId})`);

      // If announcement was sent, create notifications for users
      if (announcement.status === 'sent') {
        // Get target users based on audience
        let userQuery = 'SELECT id FROM users WHERE 1=1';
        let params = [];

        switch (announcement.target_audience) {
          case 'job-seekers':
            userQuery += ' AND role IN ("user", "job_seeker")';
            break;
          case 'employers':
            userQuery += ' AND role = "employer"';
            break;
          case 'premium':
            userQuery += ' AND subscription_type = "premium"';
            break;
          // 'all' doesn't need additional filtering
        }

        const [targetUsers] = await pool.execute(userQuery, params);
        
        // Create notifications for each target user
        for (const user of targetUsers) {
          await pool.execute(
            `INSERT INTO notifications (user_id, title, message, type, announcement_id, priority)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              user.id,
              announcement.title,
              announcement.message,
              'announcement',
              announcementId,
              announcement.type === 'urgent' ? 'urgent' : 'medium'
            ]
          );
        }
        
        console.log(`Created ${targetUsers.length} notifications for announcement: ${announcement.title}`);
      }
    }

    // Create default notification preferences for existing users
    await pool.execute(`
      INSERT IGNORE INTO notification_preferences (user_id)
      SELECT id FROM users WHERE id NOT IN (SELECT user_id FROM notification_preferences)
    `);

    console.log('Sample data created successfully!');
    
    // Show summary
    const [announcementCount] = await pool.execute('SELECT COUNT(*) as count FROM announcements');
    const [notificationCount] = await pool.execute('SELECT COUNT(*) as count FROM notifications');
    const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
    
    console.log('\n=== Summary ===');
    console.log(`Total announcements: ${announcementCount[0].count}`);
    console.log(`Total notifications: ${notificationCount[0].count}`);
    console.log(`Total users: ${userCount[0].count}`);

  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    process.exit(0);
  }
}

createSampleData();
