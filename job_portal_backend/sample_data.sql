-- Insert sample users
INSERT INTO users (id, name, email, password_hash, role, status, last_active_at) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Admin User', 'admin@example.com', '$2a$10$rHJ3qfQo2/nqmV4NZqVz5O1JNjUyHMWyJ4QQzJ9QhCFYsZCgJQYl.', 'admin', 'active', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'John Doe', 'user@example.com', '$2a$10$rHJ3qfQo2/nqmV4NZqVz5O1JNjUyHMWyJ4QQzJ9QhCFYsZCgJQYl.', 'job_seeker', 'active', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Shyam Kumar', 'justsgk07@gmail.com', '$2a$10$rHJ3qfQo2/nqmV4NZqVz5O1JNjUyHMWyJ4QQzJ9QhCFYsZCgJQYl.', 'job_seeker', 'active', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Employer User', 'employer@example.com', '$2a$10$rHJ3qfQo2/nqmV4NZqVz5O1JNjUyHMWyJ4QQzJ9QhCFYsZCgJQYl.', 'employer', 'active', NOW());

-- Insert job seeker profiles
INSERT INTO job_seeker_profiles (id, user_id, skills, experience, education, bio, first_name, last_name, phone_number) VALUES 
('750e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'JavaScript, React, Node.js, MongoDB', '2 years software development experience', 'Bachelor of Computer Science', 'Passionate full-stack developer with experience in modern web technologies.', 'John', 'Doe', '+1234567890'),
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Python, Java, Django, AI/ML', '1+ years of experience in AI/ML', 'B.Tech in CSE(AI)', 'Hey! This is Shyam, passionate about AI and software development', 'Shyam', 'Kumar', '1234567890');

-- Insert sample jobs
INSERT INTO jobs (id, title, company_name, location, employment_type, experience_level, category, description, requirements, posted_by, views, expires_at) VALUES 
('650e8400-e29b-41d4-a716-446655440000', 'Full Stack Developer', 'TechCorp Solutions', 'San Francisco, CA', 'Full-time', 'Mid-level', 'Software Development', 'We are looking for a talented Full Stack Developer to join our growing team. You will be responsible for developing and maintaining web applications using modern technologies.', 'Bachelor degree in Computer Science or related field. 2+ years experience with React, Node.js, and databases. Strong problem-solving skills.', '550e8400-e29b-41d4-a716-446655440003', 45, DATE_ADD(NOW(), INTERVAL 30 DAY)),
('650e8400-e29b-41d4-a716-446655440001', 'Frontend Developer', 'Digital Innovations Inc', 'New York, NY', 'Full-time', 'Junior', 'Software Development', 'Join our frontend team to create amazing user experiences. Work with React, TypeScript, and modern CSS frameworks.', '1+ years experience with React or similar frameworks. Knowledge of HTML, CSS, JavaScript. Understanding of responsive design principles.', '550e8400-e29b-41d4-a716-446655440003', 32, DATE_ADD(NOW(), INTERVAL 45 DAY)),
('650e8400-e29b-41d4-a716-446655440002', 'Python Developer', 'AI Solutions Ltd', 'Remote', 'Contract', 'Mid-level', 'Software Development', 'Looking for a Python developer to work on AI/ML projects. Experience with Django, FastAPI, and machine learning libraries preferred.', 'Strong Python programming skills. Experience with Django or FastAPI. Knowledge of machine learning libraries like scikit-learn, pandas, numpy.', '550e8400-e29b-41d4-a716-446655440003', 67, DATE_ADD(NOW(), INTERVAL 60 DAY)),
('650e8400-e29b-41d4-a716-446655440003', 'UI/UX Designer', 'Creative Studio Pro', 'Los Angeles, CA', 'Part-time', 'Senior', 'Design', 'We need a creative UI/UX designer to design intuitive and beautiful user interfaces for our web and mobile applications.', '3+ years of UI/UX design experience. Proficiency in Figma, Adobe XD, or similar tools. Strong portfolio showcasing web and mobile designs.', '550e8400-e29b-41d4-a716-446655440003', 23, DATE_ADD(NOW(), INTERVAL 30 DAY)),
('650e8400-e29b-41d4-a716-446655440004', 'DevOps Engineer', 'CloudTech Services', 'Austin, TX', 'Full-time', 'Senior', 'Infrastructure', 'Seeking an experienced DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines.', 'Experience with AWS/Azure/GCP. Knowledge of Docker, Kubernetes, Jenkins. Scripting skills in Python or Bash. Experience with infrastructure as code.', '550e8400-e29b-41d4-a716-446655440003', 41, DATE_ADD(NOW(), INTERVAL 30 DAY));

-- Insert sample applications
INSERT INTO applications (id, user_id, job_id, status, applied_at, cover_letter) VALUES 
('850e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440000', 'applied', NOW(), 'I am very interested in this Full Stack Developer position and believe my skills in React and Node.js make me a great fit.'),
('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', 'applied', NOW(), 'As someone passionate about AI/ML with Python experience, I would love to contribute to your AI projects.');

-- Note: All passwords are hashed version of "123456" for testing purposes
-- You should change these in production
