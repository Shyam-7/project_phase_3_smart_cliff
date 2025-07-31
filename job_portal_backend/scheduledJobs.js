const db = require('./db');

class ScheduledJobManager {
  constructor() {
    this.isRunning = false;
  }

  // Start the scheduled job manager
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('📅 Scheduled job manager started');
    
    // Check every minute for scheduled announcements
    this.intervalId = setInterval(() => {
      this.processScheduledAnnouncements();
    }, 60000); // 1 minute

    // Run immediately on startup
    this.processScheduledAnnouncements();
  }

  // Stop the scheduled job manager
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('📅 Scheduled job manager stopped');
  }

  // Process scheduled announcements
  async processScheduledAnnouncements() {
    try {
      const now = new Date();
      
      // Find announcements that are scheduled and due to be sent
      const [scheduledAnnouncements] = await db.execute(`
        SELECT * FROM announcements 
        WHERE status = 'scheduled' 
        AND scheduled_at <= ?
      `, [now]);

      for (const announcement of scheduledAnnouncements) {
        console.log(`📢 Processing scheduled announcement: ${announcement.title}`);
        
        // Update status to sent
        await db.execute(
          'UPDATE announcements SET status = ?, sent_at = ? WHERE id = ?',
          ['sent', now, announcement.id]
        );

        // Create notifications for users
        await this.createNotificationsForAnnouncement(
          announcement.id,
          announcement.title,
          announcement.message,
          announcement.target_audience
        );

        console.log(`✅ Announcement "${announcement.title}" sent successfully`);
      }

      if (scheduledAnnouncements.length > 0) {
        console.log(`📊 Processed ${scheduledAnnouncements.length} scheduled announcement(s)`);
      }
    } catch (error) {
      console.error('❌ Error processing scheduled announcements:', error);
    }
  }

  // Create notifications for users based on target audience
  async createNotificationsForAnnouncement(announcementId, title, message, targetAudience) {
    try {
      // Get users based on target audience
      let userQuery = 'SELECT id FROM users';
      let params = [];

      if (targetAudience === 'job-seekers') {
        userQuery += ' WHERE role = ?';
        params = ['user'];
      } else if (targetAudience === 'employers') {
        userQuery += ' WHERE role = ?';
        params = ['employer'];
      }
      // 'all' doesn't need WHERE clause

      const [users] = await db.execute(userQuery, params);

      // Create notifications for each user
      const notificationPromises = users.map(user => {
        return db.execute(
          'INSERT INTO notifications (user_id, title, message, type, announcement_id, priority) VALUES (?, ?, ?, ?, ?, ?)',
          [user.id, title, message, 'announcement', announcementId, 'medium']
        );
      });

      await Promise.all(notificationPromises);
      console.log(`📱 Created ${users.length} notifications for announcement ${announcementId}`);
    } catch (error) {
      console.error('❌ Error creating notifications for announcement:', error);
    }
  }

  // Get status information
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastCheck: new Date()
    };
  }
}

module.exports = new ScheduledJobManager();
