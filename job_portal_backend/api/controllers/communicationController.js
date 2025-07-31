const db = require('../../db');

class CommunicationController {
  // Create announcement
  async createAnnouncement(req, res) {
    try {
      const { title, message, target_audience, scheduled_at, type, send_methods, status } = req.body;
      
      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message: 'Title and message are required'
        });
      }

      // Determine status: draft, scheduled, or sent
      let announcementStatus = 'sent'; // default
      if (status === 'draft') {
        announcementStatus = 'draft';
      } else if (scheduled_at) {
        announcementStatus = 'scheduled';
      }

      const defaultSendMethods = send_methods || { email: false, in_app: true, push: false };
      const sentAt = (announcementStatus === 'sent') ? new Date() : null;
      
      const query = `
        INSERT INTO announcements (title, message, target_audience, created_by, status, scheduled_at, sent_at, type, send_methods)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await db.execute(query, [
        title,
        message,
        target_audience || 'all',
        req.user.id,
        announcementStatus,
        scheduled_at || null,
        sentAt,
        type || 'general',
        JSON.stringify(defaultSendMethods)
      ]);

      // If it's a sent announcement, create notifications for users
      if (announcementStatus === 'sent') {
        await this.createNotificationsForAnnouncement(result.insertId, title, message, target_audience || 'all');
      }

      // Fetch the created announcement
      const [announcement] = await db.execute(
        'SELECT * FROM announcements WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: `Announcement ${announcementStatus === 'draft' ? 'saved as draft' : announcementStatus === 'scheduled' ? 'scheduled' : 'sent'} successfully`,
        announcement: announcement[0]
      });
    } catch (error) {
      console.error('Error creating announcement:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get announcements
  async getAnnouncements(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status || 'sent';
      const offset = (page - 1) * limit;

      // Get total count
      const [countResult] = await db.execute(
        'SELECT COUNT(*) as total FROM announcements WHERE status = ?',
        [status]
      );
      const total = countResult[0].total;

      // Get announcements with pagination and creator name
      const query = `
        SELECT a.*, u.name as created_by_name 
        FROM announcements a
        LEFT JOIN users u ON a.created_by = u.id
        WHERE a.status = '${status}'
        ORDER BY a.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const [announcements] = await db.query(query);

      res.json({
        success: true,
        announcements,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      });
    } catch (error) {
      console.error('Error fetching announcements:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get announcement statistics
  async getAnnouncementStats(req, res) {
    try {
      const [stats] = await db.execute(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
          SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
          SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
          SUM(CASE WHEN MONTH(created_at) = MONTH(CURRENT_DATE()) 
                   AND YEAR(created_at) = YEAR(CURRENT_DATE()) THEN 1 ELSE 0 END) as this_month
        FROM announcements
      `);

      res.json({
        success: true,
        stats: {
          total_announcements: stats[0].total || 0,
          sent_announcements: stats[0].sent || 0,
          scheduled_announcements: stats[0].scheduled || 0,
          draft_announcements: stats[0].draft || 0,
          active_notifications: stats[0].this_month || 0
        }
      });
    } catch (error) {
      console.error('Error fetching announcement stats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Send custom notification
  async sendCustomNotification(req, res) {
    try {
      const { title, message, recipients, type } = req.body;

      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message: 'Title and message are required'
        });
      }

      // Initialize notifications array if it doesn't exist
      if (!db.data.notifications) {
        db.data.notifications = [];
      }

      const notification = {
        id: Date.now().toString(),
        title,
        message,
        type: type || 'info',
        recipients: recipients || 'all',
        sent_by: req.user.id,
        created_at: new Date().toISOString(),
        is_read: false
      };

      db.data.notifications.push(notification);
      await db.write();

      res.status(201).json({
        success: true,
        message: 'Notification sent successfully',
        notification
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get user notifications
  async getUserNotifications(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Get total count of user notifications
      const [countResult] = await db.execute(
        'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?',
        [req.user.id]
      );
      const total = countResult[0].total;

      // Get notifications with pagination (using query instead of execute for LIMIT/OFFSET)
      const query = `
        SELECT * FROM notifications 
        WHERE user_id = '${req.user.id}'
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const [notifications] = await db.query(query);

      // Get unread count
      const [unreadResult] = await db.execute(
        'SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = FALSE',
        [req.user.id]
      );
      const unreadCount = unreadResult[0].unread;

      res.json({
        success: true,
        notifications,
        unread: unreadCount,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      });
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Mark notification as read
  async markNotificationAsRead(req, res) {
    try {
      const { notificationId } = req.params;

      const [result] = await db.execute(
        'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND user_id = ?',
        [notificationId, req.user.id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(req, res) {
    try {
      await db.execute(
        'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE',
        [req.user.id]
      );

      res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get notification preferences
  async getNotificationPreferences(req, res) {
    try {
      const [preferences] = await db.execute(
        'SELECT * FROM notification_preferences WHERE user_id = ?',
        [req.user.id]
      );

      // If no preferences exist, create default ones
      if (preferences.length === 0) {
        await db.execute(
          'INSERT INTO notification_preferences (user_id) VALUES (?)',
          [req.user.id]
        );
        
        const [newPreferences] = await db.execute(
          'SELECT * FROM notification_preferences WHERE user_id = ?',
          [req.user.id]
        );
        
        return res.json({
          success: true,
          preferences: newPreferences[0]
        });
      }

      res.json({
        success: true,
        preferences: preferences[0]
      });
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(req, res) {
    try {
      const {
        email_notifications,
        push_notifications,
        job_alerts,
        application_updates,
        announcement_notifications
      } = req.body;

      await db.execute(`
        UPDATE notification_preferences 
        SET email_notifications = ?, push_notifications = ?, job_alerts = ?, 
            application_updates = ?, announcement_notifications = ?, updated_at = NOW()
        WHERE user_id = ?
      `, [
        email_notifications,
        push_notifications,
        job_alerts,
        application_updates,
        announcement_notifications,
        req.user.id
      ]);

      const [updatedPreferences] = await db.execute(
        'SELECT * FROM notification_preferences WHERE user_id = ?',
        [req.user.id]
      );

      res.json({
        success: true,
        message: 'Notification preferences updated successfully',
        preferences: updatedPreferences[0]
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get scheduled announcements
  async getScheduledAnnouncements(req, res) {
    try {
      const [announcements] = await db.execute(`
        SELECT a.*, u.name as created_by_name 
        FROM announcements a
        LEFT JOIN users u ON a.created_by = u.id
        WHERE a.status = 'scheduled'
        ORDER BY a.scheduled_at ASC, a.created_at ASC
      `);

      res.json({
        success: true,
        announcements
      });
    } catch (error) {
      console.error('Error fetching scheduled announcements:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Cancel scheduled announcement
  async cancelScheduledAnnouncement(req, res) {
    try {
      const { id } = req.params;

      const [result] = await db.execute(
        'UPDATE announcements SET status = "cancelled" WHERE id = ? AND status = "scheduled"',
        [id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Scheduled announcement not found or already processed'
        });
      }

      res.json({
        success: true,
        message: 'Scheduled announcement cancelled successfully'
      });
    } catch (error) {
      console.error('Error cancelling scheduled announcement:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get draft announcements
  async getDraftAnnouncements(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Get total count
      const [countResult] = await db.execute(
        'SELECT COUNT(*) as total FROM announcements WHERE status = ?',
        ['draft']
      );
      const total = countResult[0].total;

      // Get draft announcements with pagination
      const query = `
        SELECT a.*, u.name as created_by_name 
        FROM announcements a
        LEFT JOIN users u ON a.created_by = u.id
        WHERE a.status = 'draft'
        ORDER BY a.updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const [announcements] = await db.query(query);

      res.json({
        success: true,
        announcements,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      });
    } catch (error) {
      console.error('Error fetching draft announcements:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update announcement
  async updateAnnouncement(req, res) {
    try {
      const { id } = req.params;
      const { title, message, target_audience, scheduled_at, type, send_methods, status } = req.body;
      
      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message: 'Title and message are required'
        });
      }

      // Check if announcement exists and is editable
      const [existing] = await db.execute(
        'SELECT * FROM announcements WHERE id = ?',
        [id]
      );

      if (!existing || existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Announcement not found'
        });
      }

      // Only allow editing of draft or scheduled announcements
      if (existing[0].status === 'sent') {
        return res.status(400).json({
          success: false,
          message: 'Cannot edit sent announcements'
        });
      }

      // Determine new status
      let newStatus = status || existing[0].status;
      if (status === 'draft') {
        newStatus = 'draft';
      } else if (scheduled_at) {
        newStatus = 'scheduled';
      } else if (status === 'send') {
        newStatus = 'sent';
      }

      const sentAt = (newStatus === 'sent' && existing[0].status !== 'sent') ? new Date() : existing[0].sent_at;
      
      const query = `
        UPDATE announcements 
        SET title = ?, message = ?, target_audience = ?, scheduled_at = ?, sent_at = ?, 
            type = ?, send_methods = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      await db.execute(query, [
        title,
        message,
        target_audience || 'all',
        scheduled_at || null,
        sentAt,
        type || 'general',
        JSON.stringify(send_methods || { email: false, in_app: true, push: false }),
        newStatus,
        id
      ]);

      // If status changed to sent, create notifications
      if (newStatus === 'sent' && existing[0].status !== 'sent') {
        await this.createNotificationsForAnnouncement(id, title, message, target_audience || 'all');
      }

      // Fetch updated announcement
      const [updated] = await db.execute(
        'SELECT * FROM announcements WHERE id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Announcement updated successfully',
        announcement: updated[0]
      });
    } catch (error) {
      console.error('Error updating announcement:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Helper method to create notifications for users
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
    } catch (error) {
      console.error('Error creating notifications for announcement:', error);
    }
  }
}

module.exports = new CommunicationController();
