const { applyToJob } = require('./api/controllers/applicationController');

// Mock request and response objects
const mockReq = {
  user: { id: '550e8400-e29b-41d4-a716-446655440002' },
  body: {
    jobId: '650e8400-e29b-41d4-a716-446655440000',
    coverLetter: 'Test application from direct call',
    fullName: 'Direct Test User',
    email: 'directtest@example.com',
    phone: '9999999999',
    quickApply: true
  }
};

const mockRes = {
  status: function(code) {
    console.log('Response status:', code);
    return this;
  },
  json: function(data) {
    console.log('Response JSON:', JSON.stringify(data, null, 2));
  }
};

console.log('Testing applyToJob function directly...');
applyToJob(mockReq, mockRes).catch(console.error);
