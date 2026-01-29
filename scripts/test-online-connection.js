// Script to test online database connection
// Run: node test-online-connection.js

const https = require('https');

const APP_URL = 'https://fhdgroub.vercel.app';

console.log('🧪 Testing Online Database Connection...\n');
console.log(`📋 App URL: ${APP_URL}\n`);

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testConnection() {
  try {
    console.log('🔍 Testing /api/test-db endpoint...\n');
    
    const result = await makeRequest(`${APP_URL}/api/test-db`);
    
    console.log(`📊 Status Code: ${result.status}\n`);
    
    if (result.status === 200) {
      console.log('✅ Database connection successful!\n');
      console.log('📋 Response:');
      console.log(JSON.stringify(result.data, null, 2));
      
      if (result.data.success) {
        console.log('\n🎉 Everything is working correctly!');
        console.log('\n✅ You can now:');
        console.log('   1. Go to: https://fhdgroub.vercel.app/login');
        console.log('   2. Login with PIN Code: 1234');
        console.log('   3. Start using the application!');
      }
    } else {
      console.log('❌ Database connection failed!\n');
      console.log('📋 Error Response:');
      console.log(JSON.stringify(result.data, null, 2));
      
      if (result.data.error) {
        console.log(`\n❌ Error: ${result.data.error}`);
      }
      if (result.data.solution) {
        console.log(`\n💡 Solution: ${result.data.solution}`);
      }
    }
  } catch (error) {
    console.error('\n❌ Error testing connection:', error.message);
    console.log('\n💡 Possible issues:');
    console.log('   1. The app might still be deploying');
    console.log('   2. Check Vercel Dashboard for deployment status');
    console.log('   3. Check Vercel Logs for errors');
  }
}

testConnection();
