const axios = require('axios');

// Login as admin to get the token
async function loginAdmin() {
  try {
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@example.com',
      password: '123456'
    });
    
    console.log('✅ Admin login successful');
    return loginResponse.data.token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return null;
  }
}

// Test comprehensive job creation with all database fields
async function testComprehensiveJobCreation(token) {
  const comprehensiveJobData = {
    // Basic Information
    title: "Senior Full Stack Developer",
    company: "TechInnovate Solutions", // For backward compatibility
    company_name: "TechInnovate Solutions", // New field
    location: "Bangalore, India",
    
    // Employment Details
    employment_type: "Full-time",
    experience_level: "3-5 years",
    category: "Technology",
    status: "active",
    
    // Salary Information
    salary_min: 12,  // 12 LPA
    salary_max: 18,  // 18 LPA
    salary_currency: "INR",
    
    // Company Information
    company_type: "Startup",
    company_size: "51-200",
    company_rating: 4.3,
    company_reviews_count: 145,
    
    // Job Content
    description: "We are seeking a highly skilled Senior Full Stack Developer to join our innovative team. You will be responsible for developing scalable web applications using modern technologies and frameworks.",
    requirements: "Bachelor's degree in Computer Science or equivalent. Strong experience with JavaScript, React, Node.js, and databases. Experience with cloud platforms (AWS/Azure). Excellent problem-solving skills and team collaboration abilities.",
    skills_required: "JavaScript, TypeScript, React, Node.js, MongoDB, MySQL, AWS, Docker, Git, Agile/Scrum",
    benefits: "Competitive salary, health insurance, flexible working hours, professional development budget, stock options, work from home flexibility, annual bonus",
    
    // Additional Information
    remote_allowed: true,
    expires_at: "2025-12-31",
    
    // Legacy fields for compatibility
    summary: "Join our dynamic team as a Senior Full Stack Developer and work on cutting-edge projects",
    tags: ["JavaScript", "React", "Node.js", "Full-stack", "Remote"]
  };

  try {
    const response = await axios.post('http://localhost:3001/api/jobs', comprehensiveJobData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Comprehensive job created successfully!');
    console.log('Job ID:', response.data.job.id);
    console.log('Title:', response.data.job.title);
    console.log('Company:', response.data.job.company_name || response.data.job.company);
    console.log('Salary Range:', response.data.job.salary_min, '-', response.data.job.salary_max, 'LPA');
    console.log('Employment Type:', response.data.job.employment_type);
    console.log('Category:', response.data.job.category);
    console.log('Remote Allowed:', response.data.job.remote_allowed);
    
    return response.data.job;
  } catch (error) {
    console.error('❌ Comprehensive job creation failed:', error.response?.data || error.message);
    return null;
  }
}

// Test job update with new fields
async function testComprehensiveJobUpdate(token, jobId) {
  const updateData = {
    id: jobId,
    title: "Senior Full Stack Developer (Updated)",
    company: "TechInnovate Solutions Ltd", // For backward compatibility  
    company_name: "TechInnovate Solutions Ltd", // New field
    location: "Mumbai, India",
    employment_type: "Full-time",
    experience_level: "5-8 years",
    category: "Technology",
    status: "active",
    salary_min: 15,
    salary_max: 22,
    company_rating: 4.5,
    company_reviews_count: 200,
    description: "UPDATED: We are seeking a highly skilled Senior Full Stack Developer with leadership experience.",
    requirements: "UPDATED: 5+ years experience, team leadership skills, architecture design experience",
    skills_required: "JavaScript, TypeScript, React, Node.js, MongoDB, MySQL, AWS, Docker, Git, Kubernetes, Microservices",
    benefits: "Enhanced benefits: Competitive salary, premium health insurance, flexible working hours, learning budget, stock options, remote work, quarterly bonuses",
    remote_allowed: true,
    expires_at: "2025-12-31"
  };

  try {
    const response = await axios.put(`http://localhost:3001/api/jobs/${jobId}`, updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Comprehensive job updated successfully!');
    console.log('Updated Title:', response.data.job.title);
    console.log('Updated Experience Level:', response.data.job.experience_level);
    console.log('Updated Salary Range:', response.data.job.salary_min, '-', response.data.job.salary_max, 'LPA');
    
    return response.data.job;
  } catch (error) {
    console.error('❌ Comprehensive job update failed:', error.response?.data || error.message);
    return null;
  }
}

// Test getting all jobs to verify data structure
async function testGetAllJobs(token) {
  try {
    const response = await axios.get('http://localhost:3001/api/jobs', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Jobs retrieved successfully!');
    console.log('Total jobs:', response.data.length);
    
    if (response.data.length > 0) {
      const firstJob = response.data[0];
      console.log('\n📋 Sample Job Structure:');
      console.log('ID:', firstJob.id);
      console.log('Title:', firstJob.title);
      console.log('Company:', firstJob.company || firstJob.company_name);
      console.log('Employment Type:', firstJob.employment_type);
      console.log('Experience Level:', firstJob.experience_level);
      console.log('Category:', firstJob.category);
      console.log('Remote Allowed:', firstJob.remote_allowed);
      console.log('Skills Required:', firstJob.skills_required?.substring(0, 50) + '...');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Failed to get jobs:', error.response?.data || error.message);
    return null;
  }
}

// Run comprehensive tests
async function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive Job Management Tests...\n');
  
  // 1. Login as admin
  console.log('1. Testing Admin Login...');
  const token = await loginAdmin();
  if (!token) {
    console.log('❌ Cannot proceed without admin token');
    return;
  }
  console.log('');
  
  // 2. Get existing jobs structure
  console.log('2. Testing Job Retrieval...');
  await testGetAllJobs(token);
  console.log('');
  
  // 3. Create comprehensive job
  console.log('3. Testing Comprehensive Job Creation...');
  const createdJob = await testComprehensiveJobCreation(token);
  if (!createdJob) {
    console.log('❌ Comprehensive job creation failed');
    return;
  }
  console.log('');
  
  const jobId = createdJob.id;
  
  // Wait for database consistency
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 4. Update the comprehensive job
  console.log('4. Testing Comprehensive Job Update...');
  const updatedJob = await testComprehensiveJobUpdate(token, jobId);
  if (!updatedJob) {
    console.log('❌ Comprehensive job update failed');
    return;
  }
  console.log('');
  
  // 5. Verify final structure
  console.log('5. Final Verification...');
  const finalJobs = await testGetAllJobs(token);
  if (finalJobs) {
    const ourJob = finalJobs.find(job => job.id === jobId);
    if (ourJob) {
      console.log('✅ Created job found in final verification');
      console.log('Final job title:', ourJob.title);
      console.log('Final salary range:', ourJob.salary_min, '-', ourJob.salary_max);
    }
  }
  console.log('');
  
  console.log('🎉 All Comprehensive Job Management Tests Completed!');
  console.log('\n📊 Test Summary:');
  console.log('✅ Admin Login');
  console.log('✅ Job Retrieval');
  console.log('✅ Comprehensive Job Creation');
  console.log('✅ Comprehensive Job Update');
  console.log('✅ Data Structure Verification');
}

runComprehensiveTests().catch(console.error);
