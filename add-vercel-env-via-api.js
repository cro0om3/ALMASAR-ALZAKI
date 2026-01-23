// Script to add Environment Variables to Vercel via API
// Run: node add-vercel-env-via-api.js
// 
// Requirements:
// 1. Vercel API Token (get it from: https://vercel.com/account/tokens)
// 2. Project ID: prj_vYVJ3thAnk1Z78QK6vmrKfD2rY7k

const https = require('https');

// ============================================
// CONFIGURATION
// ============================================
const VERCEL_API_TOKEN = process.env.VERCEL_TOKEN || ''; // Add your token here or use env var
const PROJECT_ID = 'prj_vYVJ3thAnk1Z78QK6vmrKfD2rY7k';

// Environment Variables to add
const ENV_VARS = [
  {
    key: 'DATABASE_URL',
    value: 'postgresql://postgres:Fhd%23%232992692@db.tundlptcusiogiaagsba.supabase.co:5432/postgres?sslmode=require',
    target: ['production', 'preview', 'development'], // All environments
    type: 'encrypted'
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    value: 'https://tundlptcusiogiaagsba.supabase.co',
    target: ['production', 'preview', 'development'],
    type: 'encrypted'
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    value: 'sb_publishable_l-7BTT9CzD5fkuKxGpOfMg_nsz72V-Q',
    target: ['production', 'preview', 'development'],
    type: 'encrypted'
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    value: 'sb_secret_8hIdHJTfUdAwUTyHjHaAIw_j0VDaTmx',
    target: ['production', 'preview', 'development'],
    type: 'encrypted',
    sensitive: true
  }
];

// ============================================
// Helper function to make API requests
// ============================================
function makeRequest(options, data) {
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
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// ============================================
// Add Environment Variable
// ============================================
async function addEnvVar(envVar) {
  const options = {
    hostname: 'api.vercel.com',
    path: `/v10/projects/${PROJECT_ID}/env`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  const payload = {
    key: envVar.key,
    value: envVar.value,
    type: envVar.type || 'encrypted',
    target: envVar.target || ['production', 'preview', 'development']
  };

  try {
    const result = await makeRequest(options, payload);
    return result;
  } catch (error) {
    throw error;
  }
}

// ============================================
// Get existing Environment Variables
// ============================================
async function getEnvVars() {
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
    return result.data.envs || [];
  } catch (error) {
    return [];
  }
}

// ============================================
// Main function
// ============================================
async function main() {
  console.log('🚀 Adding Environment Variables to Vercel via API...\n');

  // Check if token is provided
  if (!VERCEL_API_TOKEN) {
    console.error('❌ ERROR: VERCEL_TOKEN is not set!');
    console.log('\n💡 How to get Vercel API Token:');
    console.log('   1. Go to: https://vercel.com/account/tokens');
    console.log('   2. Create a new token');
    console.log('   3. Set it as environment variable:');
    console.log('      Windows: set VERCEL_TOKEN=your_token_here');
    console.log('      Or add it to .env.local: VERCEL_TOKEN=your_token_here');
    console.log('\n   Then run: node add-vercel-env-via-api.js');
    process.exit(1);
  }

  console.log(`📋 Project ID: ${PROJECT_ID}\n`);

  // Get existing env vars
  console.log('🔍 Checking existing Environment Variables...');
  const existing = await getEnvVars();
  const existingKeys = existing.map(e => e.key);
  console.log(`   Found ${existing.length} existing variable(s)\n`);

  // Add each environment variable
  for (const envVar of ENV_VARS) {
    try {
      if (existingKeys.includes(envVar.key)) {
        console.log(`⚠️  ${envVar.key} already exists, skipping...`);
        continue;
      }

      console.log(`📝 Adding ${envVar.key}...`);
      const result = await addEnvVar(envVar);
      
      if (result.status === 200 || result.status === 201) {
        console.log(`   ✅ ${envVar.key} added successfully!`);
      } else {
        console.log(`   ⚠️  ${envVar.key} - Status: ${result.status}`);
      }
    } catch (error) {
      if (error.error && error.error.error) {
        if (error.error.error.message && error.error.error.message.includes('already exists')) {
          console.log(`   ⚠️  ${envVar.key} already exists`);
        } else {
          console.log(`   ❌ ${envVar.key} failed: ${error.error.error.message || JSON.stringify(error.error)}`);
        }
      } else {
        console.log(`   ❌ ${envVar.key} failed: ${error.message || JSON.stringify(error)}`);
      }
    }
  }

  console.log('\n✅ Done!');
  console.log('\n📝 Next steps:');
  console.log('   1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
  console.log('   2. Verify all variables are added');
  console.log('   3. Redeploy your project');
  console.log('\n🎉 Environment Variables added successfully!');
}

// Run
main().catch(console.error);
