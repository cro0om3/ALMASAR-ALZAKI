// Test login API directly
require('dotenv').config({ path: '.env.local' });
const https = require('http');

const API_URL = 'http://localhost:3000/api/auth/login';

console.log('🧪 Testing Login API...\n');
console.log(`📋 API URL: ${API_URL}\n`);

const testData = {
  pinCode: '1234'
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log(`📊 Status Code: ${res.statusCode}\n`);
    
    try {
      const parsed = JSON.parse(body);
      
      if (res.statusCode === 200) {
        console.log('✅ Login successful!\n');
        console.log('📋 User Data:');
        console.log(JSON.stringify(parsed, null, 2));
      } else {
        console.log('❌ Login failed!\n');
        console.log('📋 Error Response:');
        console.log(JSON.stringify(parsed, null, 2));
        
        if (parsed.error) {
          console.log(`\n❌ Error: ${parsed.error}`);
        }
        if (parsed.details) {
          console.log(`\n💡 Details: ${parsed.details}`);
        }
      }
    } catch (e) {
      console.log('❌ Failed to parse response\n');
      console.log('📋 Raw Response:');
      console.log(body);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Request error:', error.message);
  console.log('\n💡 Make sure the server is running on port 3000');
  console.log('   Run: npm run dev');
});

req.write(postData);
req.end();
