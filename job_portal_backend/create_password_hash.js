const bcrypt = require('bcryptjs');

async function createPasswordHash() {
  const password = 'password123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
  
  // Test the hash
  const isMatch = await bcrypt.compare(password, hash);
  console.log('Hash verification:', isMatch);
}

createPasswordHash();
