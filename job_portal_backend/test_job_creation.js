const axios = require('axios');

// First, login as admin to get the token
async function loginAdmin() {
  try {
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@example.com',
      password: '123456'
    });
    
    console.log('Login successful:', loginResponse.data);
    return loginResponse.data.token;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    return null;
  }
}

// Test job creation
async function testJobCreation(token) {
  const jobData = {
    title: "Senior Angular Developer",
    company: "Test Company Ltd",
    location: "Mumbai, India",
    experience: "3-6 years",
    salary: 8, // 8 LPA
    rating: 4.5,
    reviews: 150,
    summary: "We are looking for a skilled Angular developer to join our team.",
    description: {
      overview: "Join our dynamic team as a Senior Angular Developer and work on cutting-edge web applications."
    },
    tags: ["Angular", "TypeScript", "JavaScript", "HTML", "CSS"]
  };

  try {
    const response = await axios.post('http://localhost:3001/api/jobs', jobData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Job created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Job creation failed:', error.response?.data || error.message);
    return null;
  }
}

// Test job update
async function testJobUpdate(token, jobId) {
  const updateData = {
    id: jobId,
    title: "Senior Angular Developer (Updated)",
    company: "Test Company Ltd",
    location: "Mumbai, India",
    experience: "3-6 years",
    salary: 10, // Updated to 10 LPA
    rating: 4.7,
    reviews: 175,
    summary: "Updated: We are looking for a skilled Angular developer to join our team.",
    description: {
      overview: "Updated: Join our dynamic team as a Senior Angular Developer and work on cutting-edge web applications."
    },
    tags: ["Angular", "TypeScript", "JavaScript", "HTML", "CSS", "Node.js"]
  };

  try {
    const response = await axios.put(`http://localhost:3001/api/jobs/${jobId}`, updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Job updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Job update failed:', error.response?.data || error.message);
    return null;
  }
}

// Test job deletion
async function testJobDeletion(token, jobId) {
  try {
    const response = await axios.delete(`http://localhost:3001/api/jobs/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Job deleted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Job deletion failed:', error.response?.data || error.message);
    return null;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Job Management CRUD Tests...\n');
  
  // 1. Login as admin
  console.log('1. Testing Admin Login...');
  const token = await loginAdmin();
  if (!token) {
    console.log('❌ Cannot proceed without admin token');
    return;
  }
  console.log('✅ Admin login successful\n');
  
  // 2. Create a job
  console.log('2. Testing Job Creation...');
  const createdJob = await testJobCreation(token);
  if (!createdJob) {
    console.log('❌ Job creation failed');
    return;
  }
  console.log('✅ Job creation successful\n');
  
  const jobId = createdJob.job.id;
  console.log('Created job ID:', jobId);
  
  // Wait a moment for database consistency
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 3. Update the job
  console.log('3. Testing Job Update...');
  const updatedJob = await testJobUpdate(token, jobId);
  if (!updatedJob) {
    console.log('❌ Job update failed');
    return;
  }
  console.log('✅ Job update successful\n');
  
  // 4. Delete the job
  console.log('4. Testing Job Deletion...');
  const deletionResult = await testJobDeletion(token, jobId);
  if (!deletionResult) {
    console.log('❌ Job deletion failed');
    return;
  }
  console.log('✅ Job deletion successful\n');
  
  console.log('🎉 All Job Management CRUD Tests Passed!');
}

// Install axios if not already installed
const fs = require('fs');
const { execSync } = require('child_process');

try {
  require.resolve('axios');
} catch (e) {
  console.log('Installing axios...');
  execSync('npm install axios', { stdio: 'inherit' });
}

runTests().catch(console.error);
