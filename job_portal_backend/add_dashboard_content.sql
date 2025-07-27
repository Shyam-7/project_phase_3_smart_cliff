USE job_portal;

-- Clear existing dashboard content
DELETE FROM site_content WHERE section IN ('hero', 'welcome', 'how_it_works');

-- Add hero section content for user dashboard
INSERT INTO site_content (section, section_type, title, content, additional_data, sort_order, is_active) VALUES 
('hero', 'hero', 'Find a job that suits your interest & skills.', 'Explore thousands of job opportunities that match your skills and passions. Start your career journey today with tailored recommendations and smart filters.', '{"searchSuggestions": "Designer, Programming, Digital Marketing, Video, Animation", "ctaButtonText": "Find Job", "imageUrl": "/assets/person_searching_job.png", "imageAlt": "Person searching job"}', 1, 1);

-- Add welcome section content for user dashboard
INSERT INTO site_content (section, section_type, title, content, additional_data, sort_order, is_active) VALUES 
('welcome', 'welcome', 'Welcome to Skillhunt', 'Create an account or sign in to see jobs that fit your requirements', '{"ctaButtonText": "Get Started", "ctaButtonLink": "/user/user-profile", "secondaryLinks": [{"url": "/user/user-profile", "text": "Post your resume - it only takes a few seconds"}, {"url": "#", "text": "Post a job on Skillhunt"}]}', 1, 1);

-- Add how it works section content for user dashboard
INSERT INTO site_content (section, section_type, title, content, additional_data, sort_order, is_active) VALUES 
('how_it_works', 'how_it_works', 'How Skillhunt Works', '', '{"steps": [{"icon": "fas fa-user-plus", "title": "Create account", "description": "Fill in all your details for setting up your profile visible to recruiters."}, {"icon": "fas fa-upload", "title": "Upload Resume", "description": "Showcase your skills and experience with a standout CV."}, {"icon": "fas fa-search", "title": "Find suitable job", "description": "Use smart filters to discover jobs tailored for you."}, {"icon": "fas fa-paper-plane", "title": "Apply Easily", "description": "Send applications in one click and track your progress."}]}', 1, 1);
