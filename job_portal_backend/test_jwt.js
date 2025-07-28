const jwt = require('jsonwebtoken');
require('dotenv').config();

// Test JWT generation and verification
async function testJWT() {
  console.log('Testing JWT generation and verification...\n');
  
  // Test data similar to what we use in login
  const testUser = {
    id: 'test-user-id-123',
    role: 'job_seeker'
  };
  
  console.log('1. JWT_SECRET from env:', process.env.JWT_SECRET ? 'Present' : 'Missing');
  console.log('   JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
  
  try {
    // Generate token
    console.log('\n2. Generating token...');
    const token = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('   Token generated successfully');
    console.log('   Token length:', token.length);
    console.log('   Token preview:', token.substring(0, 50) + '...');
    
    // Test verification
    console.log('\n3. Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('   Token verified successfully');
    console.log('   Decoded payload:', decoded);
    
    // Test with Bearer format (as sent by frontend)
    console.log('\n4. Testing Bearer format...');
    const bearerToken = `Bearer ${token}`;
    console.log('   Bearer token length:', bearerToken.length);
    
    const extractedToken = bearerToken.split(' ')[1];
    console.log('   Extracted token matches original:', extractedToken === token);
    
    const decodedFromBearer = jwt.verify(extractedToken, process.env.JWT_SECRET);
    console.log('   Bearer extraction and verification successful');
    
    // Test potential edge cases
    console.log('\n5. Testing edge cases...');
    
    // Test with whitespace
    const tokenWithSpaces = ` ${token} `;
    try {
      jwt.verify(tokenWithSpaces.trim(), process.env.JWT_SECRET);
      console.log('   Whitespace handling: OK');
    } catch (e) {
      console.log('   Whitespace handling: FAILED -', e.message);
    }
    
    // Test malformed token
    try {
      jwt.verify('malformed.token.here', process.env.JWT_SECRET);
      console.log('   Malformed token test: UNEXPECTED SUCCESS');
    } catch (e) {
      console.log('   Malformed token test: OK (correctly failed) -', e.message);
    }
    
    console.log('\n✅ All JWT tests passed!');
    
  } catch (error) {
    console.error('\n❌ JWT test failed:', error.message);
    console.error('Error details:', error);
  }
}

testJWT();
