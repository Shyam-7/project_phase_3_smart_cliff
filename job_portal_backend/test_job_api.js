const axios = require('axios');

async function testJobCreationAPI() {
  try {
    console.log('Testing job creation API...');
    
    // First, login as admin to get the token
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');
    
    // Test job creation
    const jobData = {
      title: 'Senior React Developer',
      company_name: 'Tech Innovations Inc',
      location: 'Mumbai',
      employment_type: 'Full-time',
      experience_level: '3-5 years',
      category: 'Technology',
      description: 'We are looking for an experienced React developer to join our team.',
      requirements: 'Experience with React, JavaScript, HTML, CSS',
      salary_min: 600000,
      salary_max: 900000,
      skills_required: 'React, JavaScript, Redux, TypeScript',
      remote_allowed: false
    };
    
    const createResponse = await axios.post('http://localhost:3001/api/jobs', jobData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Job creation successful:', createResponse.data);
    
    const jobId = createResponse.data.job.id;
    
    // Test job update
    const updateData = {
      ...jobData,
      title: 'Senior React Developer (Updated)',
      salary_max: 1000000
    };
    
    const updateResponse = await axios.put(`http://localhost:3001/api/jobs/${jobId}`, updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Job update successful:', updateResponse.data);
    
    // Clean up - delete the test job
    await axios.delete(`http://localhost:3001/api/jobs/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Test job cleaned up');
    console.log('🎉 All job CRUD operations working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing job API:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testJobCreationAPI();
