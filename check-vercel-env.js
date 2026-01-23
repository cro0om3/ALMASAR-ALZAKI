// Script to check Vercel Environment Variables via API
// Run: node check-vercel-env.js

require('dotenv').config({ path: '.env.local' });
const https = require('https');

const VERCEL_API_TOKEN = process.env.VERCEL_TOKEN || '';
const PROJECT_ID = 'prj_vYVJ3thAnk1Z78QK6vmrKfD2rY7k';

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: parsed });
          } else {
            reject({ status: res.statusCode, error: parsed });
          }
        } catch (e) {
          reject({ status: res.statusCode, error: body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function checkEnvVars() {
  console.log('🔍 Checking Vercel Environment Variables...\n');
  
  if (!VERCEL_API_TOKEN) {
    console.error('❌ VERCEL_TOKEN is not set!');
    process.exit(1);
  }

  const options = {
    hostname: 'api.vercel.com',
    path: `/v10/projects/${PROJECT_ID}/env`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${VERCEL_API_TOKEN}`
    }
  };

  try {
    const result = await makeRequest(options);
    const envs = result.data.envs || [];
    
    console.log(`📋 Found ${envs.length} Environment Variable(s):\n`);
    
    const required = ['DATABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
    
    envs.forEach(env => {
      const isRequired = required.includes(env.key);
      const targets = env.target || [];
      const hasAllEnvs = targets.includes('production') && targets.includes('preview') && targets.includes('development');
      
      console.log(`${isRequired ? '⭐' : '  '} ${env.key}:`);
      console.log(`     Value: ${env.value ? (env.value.substring(0, 50) + '...') : 'Not set'}`);
      console.log(`     Targets: ${targets.join(', ') || 'None'}`);
      console.log(`     All Environments: ${hasAllEnvs ? '✅' : '❌'}`);
      console.log('');
    });
    
    // Check missing
    const existingKeys = envs.map(e => e.key);
    const missing = required.filter(key => !existingKeys.includes(key));
    
    if (missing.length > 0) {
      console.log('❌ Missing Environment Variables:');
      missing.forEach(key => console.log(`   - ${key}`));
    } else {
      console.log('✅ All required Environment Variables are present!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.error || error.message);
  }
}

checkEnvVars();
