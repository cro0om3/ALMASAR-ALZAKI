// Script to get Connection Pooling URL from Supabase Management API and update Vercel
// Run: node get-supabase-pooling-via-api.js
// 
// Requirements:
// 1. Supabase Personal Access Token (PAT) - Get from: https://supabase.com/dashboard/account/tokens
// 2. Vercel API Token
// 3. Project ID: prj_vYVJ3thAnk1Z78QK6vmrKfD2rY7k

require('dotenv').config({ path: '.env.local' });
const https = require('https');

// ============================================
// CONFIGURATION
// ============================================
const SUPABASE_PROJECT_REF = 'tundlptcusiogiaagsba';
const SUPABASE_PAT = process.env.SUPABASE_PAT || ''; // Personal Access Token
const VERCEL_API_TOKEN = process.env.VERCEL_TOKEN || '';
const PROJECT_ID = 'prj_vYVJ3thAnk1Z78QK6vmrKfD2rY7k';

// Database password (URL encoded)
const DB_PASSWORD = 'Fhd%23%232992692';

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
// Get Pooler Config from Supabase Management API
// ============================================
async function getSupabasePoolerConfig() {
  if (!SUPABASE_PAT) {
    console.log('⚠️  SUPABASE_PAT not set, using constructed URL instead...\n');
    return null;
  }

  const options = {
    hostname: 'api.supabase.com',
    path: `/v1/projects/${SUPABASE_PROJECT_REF}/pooler/config`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${SUPABASE_PAT}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const result = await makeRequest(options);
    return result.data;
  } catch (error) {
    console.log('⚠️  Could not fetch pooler config from API, using constructed URL...\n');
    return null;
  }
}

// ============================================
// Construct Connection Pooling URL
// ============================================
function constructConnectionPoolingUrl(poolerConfig) {
  // If we have pooler config from API, use it
  if (poolerConfig && poolerConfig.pooler_host) {
    const poolerHost = poolerConfig.pooler_host;
    const port = poolerConfig.pooler_port || 6543;
    return `postgresql://postgres.${SUPABASE_PROJECT_REF}:${DB_PASSWORD}@${poolerHost}:${port}/postgres?sslmode=require`;
  }

  // Otherwise, construct from known pattern
  // Most Supabase projects use: aws-0-REGION.pooler.supabase.com
  // For me-central-1 region
  const region = 'me-central-1';
  const poolerHost = `aws-0-${region}.pooler.supabase.com`;
  const port = 6543;
  
  return `postgresql://postgres.${SUPABASE_PROJECT_REF}:${DB_PASSWORD}@${poolerHost}:${port}/postgres?sslmode=require`;
}

// ============================================
// Get existing Environment Variables from Vercel
// ============================================
async function getVercelEnvVars() {
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
    throw error;
  }
}

// ============================================
// Delete Environment Variable from Vercel
// ============================================
async function deleteVercelEnvVar(envId) {
  const options = {
    hostname: 'api.vercel.com',
    path: `/v10/projects/${PROJECT_ID}/env/${envId}`,
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${VERCEL_API_TOKEN}`
    }
  };

  try {
    const result = await makeRequest(options);
    return result;
  } catch (error) {
    throw error;
  }
}

// ============================================
// Add Environment Variable to Vercel
// ============================================
async function addVercelEnvVar(key, value) {
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
    key: key,
    value: value,
    type: 'encrypted',
    target: ['production', 'preview', 'development']
  };

  try {
    const result = await makeRequest(options, payload);
    return result;
  } catch (error) {
    throw error;
  }
}

// ============================================
// Main function
// ============================================
async function main() {
  console.log('🚀 Getting Connection Pooling URL from Supabase API and updating Vercel...\n');

  // Check if tokens are provided
  if (!VERCEL_API_TOKEN) {
    console.error('❌ ERROR: VERCEL_TOKEN is not set!');
    console.log('\n💡 Add it to .env.local: VERCEL_TOKEN=your_token_here');
    process.exit(1);
  }

  console.log(`📋 Supabase Project: ${SUPABASE_PROJECT_REF}`);
  console.log(`📋 Vercel Project ID: ${PROJECT_ID}\n`);

  try {
    // Try to get pooler config from Supabase API
    console.log('🔍 Fetching pooler config from Supabase Management API...');
    const poolerConfig = await getSupabasePoolerConfig();
    
    // Construct Connection Pooling URL
    console.log('📝 Constructing Connection Pooling URL...');
    const connectionPoolingUrl = constructConnectionPoolingUrl(poolerConfig);
    console.log(`   URL: ${connectionPoolingUrl.substring(0, 80)}...\n`);

    // Get existing env vars from Vercel
    console.log('🔍 Checking existing Environment Variables in Vercel...');
    const existing = await getVercelEnvVars();
    const databaseUrlVar = existing.find(e => e.key === 'DATABASE_URL');
    
    if (databaseUrlVar) {
      console.log(`   Found existing DATABASE_URL (ID: ${databaseUrlVar.id})`);
      
      // Check if it's already using Connection Pooling
      if (databaseUrlVar.value && databaseUrlVar.value.includes('pooler.supabase.com')) {
        console.log('   ✅ Already using Connection Pooling');
        
        // Check if it's the same URL
        if (databaseUrlVar.value === connectionPoolingUrl) {
          console.log('   ✅ DATABASE_URL is already up to date!\n');
          console.log('✅ No changes needed!');
          return;
        } else {
          console.log('   ⚠️  Different Connection Pooling URL detected');
          console.log('   Updating to new URL...\n');
        }
      }
      
      // Delete old DATABASE_URL
      console.log('🗑️  Deleting old DATABASE_URL...');
      await deleteVercelEnvVar(databaseUrlVar.id);
      console.log('   ✅ Deleted\n');
    } else {
      console.log('   ⚠️  DATABASE_URL not found\n');
    }

    // Add new DATABASE_URL with Connection Pooling
    console.log('📝 Adding DATABASE_URL with Connection Pooling...');
    const result = await addVercelEnvVar('DATABASE_URL', connectionPoolingUrl);
    
    if (result.status === 200 || result.status === 201) {
      console.log('   ✅ DATABASE_URL updated successfully!\n');
    } else {
      console.log(`   ⚠️  Status: ${result.status}\n`);
    }

    console.log('✅ Done!');
    console.log('\n📝 Next steps:');
    console.log('   1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
    console.log('   2. Verify DATABASE_URL is updated');
    console.log('   3. Redeploy your project (important!)');
    console.log('   4. Test login functionality');
    console.log('\n🎉 DATABASE_URL updated to use Connection Pooling!');
    
    if (!SUPABASE_PAT) {
      console.log('\n💡 Tip: To get exact pooler config from Supabase API:');
      console.log('   1. Go to: https://supabase.com/dashboard/account/tokens');
      console.log('   2. Create a Personal Access Token (PAT)');
      console.log('   3. Add it to .env.local: SUPABASE_PAT=your_pat_here');
      console.log('   4. Run this script again');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.error || error.message);
    if (error.error && error.error.error) {
      console.error('   Details:', error.error.error.message || JSON.stringify(error.error));
    }
    process.exit(1);
  }
}

// Run
main().catch(console.error);
