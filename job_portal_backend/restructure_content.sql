USE job_portal;

-- Clear all existing content
DELETE FROM site_content;

-- Add actual content used in user pages

-- 1. Header content
INSERT INTO site_content (section, section_type, title, content, additional_data, sort_order, is_active) VALUES 
('header', 'header', 'Skillhunt', '', '{"logoText": "Skillhunt", "homeLink": "/user/user-dashboard", "navigation": [{"text": "Home", "url": "/user/user-dashboard"}]}', 1, 1);

-- 2. User Dashboard - Hero Section
INSERT INTO site_content (section, section_type, title, content, additional_data, sort_order, is_active) VALUES 
('hero', 'hero', 'Find a job that suits your interest & skills.', 'Explore thousands of job opportunities that match your skills and passions. Start your career journey today with tailored recommendations and smart filters.', '{"searchSuggestions": "Designer, Programming, Digital Marketing, Video, Animation", "ctaButtonText": "Find Job", "imageUrl": "/assets/person_searching_job.png", "imageAlt": "Person searching job"}', 1, 1);

-- 3. User Dashboard - Welcome Section
INSERT INTO site_content (section, section_type, title, content, additional_data, sort_order, is_active) VALUES 
('welcome', 'welcome', 'Welcome to Skillhunt', 'Create an account or sign in to see jobs that fit your requirements', '{"ctaButtonText": "Get Started", "ctaButtonLink": "/user/user-profile", "secondaryLinks": [{"url": "/user/user-profile", "text": "Post your resume - it only takes a few seconds"}, {"url": "#", "text": "Post a job on Skillhunt"}]}', 1, 1);

-- 4. User Dashboard - How It Works Section
INSERT INTO site_content (section, section_type, title, content, additional_data, sort_order, is_active) VALUES 
('how_it_works', 'how_it_works', 'How Skillhunt Works', '', '{"steps": [{"icon": "fas fa-user-plus", "title": "Create account", "description": "Fill in all your details for setting up your profile visible to recruiters."}, {"icon": "fas fa-upload", "title": "Upload Resume", "description": "Showcase your skills and experience with a standout CV."}, {"icon": "fas fa-search", "title": "Find suitable job", "description": "Use smart filters to discover jobs tailored for you."}, {"icon": "fas fa-paper-plane", "title": "Apply Easily", "description": "Send applications in one click and track your progress."}]}', 1, 1);

-- 5. Footer content
INSERT INTO site_content (section, section_type, title, content, additional_data, sort_order, is_active) VALUES 
('footer', 'footer', 'Skillhunt', 'Contact us', '{"logoText": "Skillhunt", "contactText": "Contact us", "socialLinks": [{"platform": "Facebook", "url": "#", "icon": "fab fa-facebook fa-lg"}, {"platform": "YouTube", "url": "#", "icon": "fab fa-youtube fa-lg"}, {"platform": "Instagram", "url": "#", "icon": "fab fa-instagram fa-lg"}, {"platform": "Twitter", "url": "#", "icon": "fab fa-twitter fa-lg"}], "columns": [{"title": "Candidate", "links": [{"text": "Search jobs", "url": "#"}, {"text": "Candidate Dashboard", "url": "#"}, {"text": "Saved Jobs", "url": "#"}]}, {"title": "Quick links", "links": [{"text": "Browse jobs", "url": "#"}, {"text": "Browse companies", "url": "#"}, {"text": "About", "url": "#"}]}, {"title": "Employers", "links": [{"text": "Post a job", "url": "#"}, {"text": "Search Candidates", "url": "#"}, {"text": "Applications", "url": "#"}]}, {"title": "Support", "links": [{"text": "Privacy policy", "url": "#"}, {"text": "Terms & conditions", "url": "#"}, {"text": "FAQs", "url": "#"}]}]}', 1, 1);
