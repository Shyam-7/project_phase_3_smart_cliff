-- MySQL Database Setup Script for Job Portal
-- Run this script to create and populate your database

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS job_portal;
USE job_portal;

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS job_seeker_profiles;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'job_seeker',
  `status` varchar(50) DEFAULT 'active',
  `last_active_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`)
);

-- Create jobs table
CREATE TABLE `jobs` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `title` varchar(255) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `employment_type` varchar(100) DEFAULT NULL,
  `experience_level` varchar(100) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `description` text,
  `requirements` text,
  `posted_by` varchar(36) DEFAULT NULL,
  `views` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  `salary_min` decimal(10,2) DEFAULT NULL,
  `salary_max` decimal(10,2) DEFAULT NULL,
  `salary_currency` varchar(3) DEFAULT 'INR',
  `company_rating` decimal(2,1) DEFAULT NULL,
  `company_reviews_count` int DEFAULT 0,
  `remote_allowed` boolean DEFAULT FALSE,
  `skills_required` text,
  `benefits` text,
  `company_size` varchar(50) DEFAULT NULL,
  `company_type` varchar(50) DEFAULT 'Corporate',
  PRIMARY KEY (`id`),
  KEY `posted_by_fk_idx` (`posted_by`),
  KEY `idx_category` (`category`),
  KEY `idx_location` (`location`),
  KEY `idx_experience_level` (`experience_level`),
  KEY `idx_employment_type` (`employment_type`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_salary_range` (`salary_min`, `salary_max`),
  CONSTRAINT `posted_by_fk` FOREIGN KEY (`posted_by`) REFERENCES `users` (`id`)
);

-- Create applications table
CREATE TABLE `applications` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(36) NOT NULL,
  `job_id` varchar(36) NOT NULL,
  `resume_url` varchar(255) DEFAULT NULL,
  `cover_letter` text,
  `full_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `quick_apply` boolean DEFAULT FALSE,
  `status` varchar(100) DEFAULT 'applied',
  `admin_notes` text,
  `applied_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id_fk_idx` (`user_id`),
  KEY `job_id_fk_idx` (`job_id`),
  CONSTRAINT `job_id_fk` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`),
  CONSTRAINT `user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
);

-- Create job_seeker_profiles table
CREATE TABLE `job_seeker_profiles` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(36) NOT NULL,
  `resume_url` varchar(255) DEFAULT NULL,
  `skills` text,
  `experience` text,
  `education` text,
  `bio` text,
  `cover_letter` text,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `phone_number` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id_UNIQUE` (`user_id`),
  CONSTRAINT `profile_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
);



-- Insert sample users (password is bcrypt hash of "123456")
INSERT INTO users (id, name, email, password_hash, role, status, last_active_at) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Admin User', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'John Doe', 'user@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'job_seeker', 'active', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Shyam Kumar', 'justsgk07@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'job_seeker', 'active', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Employer User', 'employer@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employer', 'active', NOW());

-- Insert job seeker profiles
INSERT INTO job_seeker_profiles (id, user_id, skills, experience, education, bio, cover_letter, first_name, last_name, phone_number) VALUES 
('750e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'JavaScript, React, Node.js, MongoDB', '2 years software development experience', 'Bachelor of Computer Science', 'Passionate full-stack developer with experience in modern web technologies.', 'I am a dedicated software developer with 2 years of experience in building modern web applications. I am passionate about creating efficient and user-friendly solutions.', 'John', 'Doe', '+1234567890'),
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Python, Java, Django, AI/ML', '1+ years of experience in AI/ML', 'B.Tech in CSE(AI)', 'Hey! This is Shyam, passionate about AI and software development', 'I am passionate about artificial intelligence and machine learning technologies. With my background in AI and software development, I bring innovative solutions to complex problems.', 'Shyam', 'Kumar', '1234567890');

-- Insert sample jobs
INSERT INTO jobs (id, title, company_name, location, employment_type, experience_level, category, description, requirements, posted_by, views, expires_at, salary_min, salary_max, company_rating, company_reviews_count, remote_allowed, skills_required, benefits, company_size, company_type) VALUES 
('650e8400-e29b-41d4-a716-446655440000', 'Full Stack Developer', 'TechCorp Solutions', 'San Francisco, CA', 'Full-time', '2-5 years', 'Software Development', 'We are looking for a talented Full Stack Developer to join our growing team. You will be responsible for developing and maintaining web applications using modern technologies.', 'Bachelor degree in Computer Science or related field. 2+ years experience with React, Node.js, and databases. Strong problem-solving skills.', '550e8400-e29b-41d4-a716-446655440003', 45, DATE_ADD(NOW(), INTERVAL 30 DAY), 600000, 1200000, 4.2, 803, TRUE, 'JavaScript, React, Node.js, MongoDB, TypeScript, Git', 'Health Insurance, Flexible Working Hours, Remote Work, Performance Bonus', '201-500', 'Corporate'),
('650e8400-e29b-41d4-a716-446655440001', 'Frontend Developer', 'Digital Innovations Inc', 'New York, NY', 'Full-time', '1-2 years', 'Software Development', 'Join our frontend team to create amazing user experiences. Work with React, TypeScript, and modern CSS frameworks.', '1+ years experience with React or similar frameworks. Knowledge of HTML, CSS, JavaScript. Understanding of responsive design principles.', '550e8400-e29b-41d4-a716-446655440003', 32, DATE_ADD(NOW(), INTERVAL 45 DAY), 400000, 800000, 3.8, 456, FALSE, 'React, TypeScript, HTML, CSS, JavaScript, Responsive Design', 'Health Insurance, Learning Budget, Team Outings', '51-200', 'Startup'),
('650e8400-e29b-41d4-a716-446655440002', 'Python Developer', 'AI Solutions Ltd', 'Remote', 'Contract', '2-5 years', 'Software Development', 'Looking for a Python developer to work on AI/ML projects. Experience with Django, FastAPI, and machine learning libraries preferred.', 'Strong Python programming skills. Experience with Django or FastAPI. Knowledge of machine learning libraries like scikit-learn, pandas, numpy.', '550e8400-e29b-41d4-a716-446655440003', 67, DATE_ADD(NOW(), INTERVAL 60 DAY), 800000, 1500000, 4.5, 234, TRUE, 'Python, Django, FastAPI, Machine Learning, pandas, numpy, scikit-learn', 'Flexible Hours, Remote Work, Project Bonus', '11-50', 'Startup'),
('650e8400-e29b-41d4-a716-446655440003', 'UI/UX Designer', 'Creative Studio Pro', 'Los Angeles, CA', 'Part-time', '5-10 years', 'Design', 'We need a creative UI/UX designer to design intuitive and beautiful user interfaces for our web and mobile applications.', '3+ years of UI/UX design experience. Proficiency in Figma, Adobe XD, or similar tools. Strong portfolio showcasing web and mobile designs.', '550e8400-e29b-41d4-a716-446655440003', 23, DATE_ADD(NOW(), INTERVAL 30 DAY), 500000, 900000, 4.0, 189, TRUE, 'Figma, Adobe XD, UI/UX Design, Prototyping, User Research', 'Flexible Hours, Creative Freedom, Design Tools Budget', '11-50', 'Creative Agency'),
('650e8400-e29b-41d4-a716-446655440004', 'DevOps Engineer', 'CloudTech Services', 'Austin, TX', 'Full-time', '5-10 years', 'Infrastructure', 'Seeking an experienced DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines.', 'Experience with AWS/Azure/GCP. Knowledge of Docker, Kubernetes, Jenkins. Scripting skills in Python or Bash. Experience with infrastructure as code.', '550e8400-e29b-41d4-a716-446655440003', 41, DATE_ADD(NOW(), INTERVAL 30 DAY), 1000000, 1800000, 4.3, 678, FALSE, 'AWS, Docker, Kubernetes, Jenkins, Python, Bash, Terraform', 'Health Insurance, Stock Options, Learning Budget, Certification Support', '201-500', 'Corporate');

-- Insert sample applications
INSERT INTO applications (id, user_id, job_id, status, applied_at, cover_letter) VALUES 
('850e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440000', 'applied', NOW(), 'I am very interested in this Full Stack Developer position and believe my skills in React and Node.js make me a great fit.'),
('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', 'applied', NOW(), 'As someone passionate about AI/ML with Python experience, I would love to contribute to your AI projects.');

-- Show completion message
SELECT 'Database setup completed successfully!' as Message;
