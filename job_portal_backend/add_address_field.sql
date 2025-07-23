-- Add address field to users table
USE job_portal;

ALTER TABLE users ADD COLUMN address TEXT AFTER status;

-- Update some sample users with address data
UPDATE users SET address = '123 Tech Street, Bangalore, Karnataka, India - 560001' WHERE email = 'john.doe@example.com';
UPDATE users SET address = '456 Business Avenue, Mumbai, Maharashtra, India - 400001' WHERE email = 'jane.smith@example.com';
UPDATE users SET address = '789 Innovation Road, Hyderabad, Telangana, India - 500001' WHERE email = 'mike.johnson@example.com';
UPDATE users SET address = '321 Development Lane, Chennai, Tamil Nadu, India - 600001' WHERE email = 'sarah.wilson@example.com';
UPDATE users SET address = '654 Enterprise Plaza, Pune, Maharashtra, India - 411001' WHERE email = 'alex.brown@example.com';
