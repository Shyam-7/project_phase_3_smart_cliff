const bcrypt = require('bcryptjs');

async function testPasswordHash() {
  const password = '123456';
  const hashFromDB = '$2b$10$JjjSaw87BjWgacwB0wTxc.AcviWcIfDUxX2B2IPtxpFwf/bYg9k7m';
  const newHash = '$2b$10$TjRNQVz/Ubsgy66ugGQaFeq9Rbij/dpxxrD.G2BjuefcuMwtW9a7i';
  
  console.log('Testing password:', password);
  console.log('Original hash from DB:', hashFromDB);
  console.log('New hash:', newHash);
  
  const match1 = await bcrypt.compare(password, hashFromDB);
  const match2 = await bcrypt.compare(password, newHash);
  
  console.log('Original hash matches:', match1);
  console.log('New hash matches:', match2);
  
  // Create a fresh hash
  const freshHash = await bcrypt.hash(password, 10);
  console.log('Fresh hash:', freshHash);
  const match3 = await bcrypt.compare(password, freshHash);
  console.log('Fresh hash matches:', match3);
}

testPasswordHash();
