-- Communication System Database Schema
USE job_portal;

-- Create announcements table
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `target_audience` varchar(100) DEFAULT 'all',
  `created_by` varchar(36) NOT NULL,
  `status` varchar(50) DEFAULT 'active',
  `scheduled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by_fk_idx` (`created_by`),
  KEY `idx_status` (`status`),
  KEY `idx_target_audience` (`target_audience`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `announcement_created_by_fk` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) DEFAULT 'general',
  `is_read` boolean DEFAULT FALSE,
  `action_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id_fk_idx` (`user_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_type` (`type`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `notification_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS `notification_preferences` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(36) NOT NULL,
  `email_notifications` boolean DEFAULT TRUE,
  `push_notifications` boolean DEFAULT TRUE,
  `job_alerts` boolean DEFAULT TRUE,
  `application_updates` boolean DEFAULT TRUE,
  `announcement_notifications` boolean DEFAULT TRUE,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id_UNIQUE` (`user_id`),
  CONSTRAINT `pref_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
);

-- Insert sample announcements
INSERT INTO `announcements` (`id`, `title`, `content`, `target_audience`, `created_by`, `status`, `scheduled_at`) VALUES 
('ann-550e8400-e29b-41d4-a716-446655440000', 'Platform Maintenance Update', 'We will be performing scheduled maintenance on our platform this weekend. Please expect brief service interruptions.', 'all', '550e8400-e29b-41d4-a716-446655440000', 'active', NULL),
('ann-550e8400-e29b-41d4-a716-446655440001', 'New Job Categories Added', 'We have added new job categories including AI/ML, Data Science, and Cybersecurity to help you find better opportunities.', 'job_seekers', '550e8400-e29b-41d4-a716-446655440000', 'active', NULL),
('ann-550e8400-e29b-41d4-a716-446655440002', 'Welcome to Skillhunt', 'Welcome to our platform! Start your job search journey today and connect with top employers.', 'registered_users', '550e8400-e29b-41d4-a716-446655440000', 'scheduled', DATE_ADD(NOW(), INTERVAL 1 DAY));

-- Insert sample notifications
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`) VALUES 
('not-550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Welcome to Skillhunt!', 'Thank you for joining our platform. Complete your profile to get better job recommendations.', 'welcome', FALSE),
('not-550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'New Job Match Found', 'We found a Python Developer position that matches your skills!', 'job_match', FALSE),
('not-550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Application Status Update', 'Your application for Full Stack Developer has been reviewed.', 'application_update', TRUE);

-- Insert default notification preferences
INSERT INTO `notification_preferences` (`user_id`) 
SELECT `id` FROM `users` WHERE `id` NOT IN (SELECT `user_id` FROM `notification_preferences`);

SELECT 'Communication schema created successfully!' as Message;
