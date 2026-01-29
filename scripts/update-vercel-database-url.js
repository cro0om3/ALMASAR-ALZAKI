// Script to update DATABASE_URL in Vercel to use Connection Pooling
// Run: node update-vercel-database-url.js
// 
// Requirements:
// 1. Vercel API Token (get it from: https://vercel.com/account/tokens)
// 2. Project ID: prj_vYVJ3thAnk1Z78QK6vmrKfD2rY7k

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const https = require('https');

// ============================================
// CONFIGURATION
// ============================================
const VERCEL_API_TOKEN = process.env.VERCEL_TOKEN || '';
const PROJECT_ID = 'prj_vYVJ3thAnk1Z78QK6vmrKfD2rY7k';

// Connection Pooling URL (better for Vercel/serverless)
// Format: postgresql://postgres.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:6543/postgres?sslmode=require
const CONNECTION_POOLING_URL = 'postgresql://postgres.tundlptcusiogiaagsba:Fhd%23%232992692@aws-0-me-central-1.pooler.supabase.com:6543/postgres?sslmode=require';

// Direct Connection URL (for reference)
const DIRECT_CONNECTION_URL = 'postgresql://postgres:Fhd%23%232992692@db.tundlptcusiogiaagsba.supabase.co:5432/postgres?sslmode=require';

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
    throw error;
  }
}

// ============================================
// Delete Environment Variable
// ============================================
async function deleteEnvVar(envId) {
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
// Add Environment Variable
// ============================================
async function addEnvVar(key, value) {
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
  console.log('🚀 Updating DATABASE_URL in Vercel to use Connection Pooling...\n');

  // Check if token is provided
  if (!VERCEL_API_TOKEN) {
    console.error('❌ ERROR: VERCEL_TOKEN is not set!');
    console.log('\n💡 How to get Vercel API Token:');
    console.log('   1. Go to: https://vercel.com/account/tokens');
    console.log('   2. Create a new token');
    console.log('   3. Add it to .env.local: VERCEL_TOKEN=your_token_here');
    console.log('\n   Then run: node update-vercel-database-url.js');
    process.exit(1);
  }

  console.log(`📋 Project ID: ${PROJECT_ID}\n`);

  try {
    // Get existing env vars
    console.log('🔍 Checking existing Environment Variables...');
    const existing = await getEnvVars();
    const databaseUrlVar = existing.find(e => e.key === 'DATABASE_URL');
    
    if (databaseUrlVar) {
      console.log(`   Found existing DATABASE_URL (ID: ${databaseUrlVar.id})`);
      console.log(`   Current value: ${databaseUrlVar.value ? databaseUrlVar.value.substring(0, 60) + '...' : 'Not set'}\n`);
      
      // Check if it's already using Connection Pooling
      if (databaseUrlVar.value && databaseUrlVar.value.includes('pooler.supabase.com')) {
        console.log('✅ DATABASE_URL is already using Connection Pooling!');
        console.log('   No update needed.\n');
        return;
      }
      
      // Delete old DATABASE_URL
      console.log('🗑️  Deleting old DATABASE_URL...');
      await deleteEnvVar(databaseUrlVar.id);
      console.log('   ✅ Old DATABASE_URL deleted\n');
    } else {
      console.log('   ⚠️  DATABASE_URL not found\n');
    }

    // Add new DATABASE_URL with Connection Pooling
    console.log('📝 Adding DATABASE_URL with Connection Pooling...');
    console.log(`   URL: ${CONNECTION_POOLING_URL.substring(0, 80)}...\n`);
    
    const result = await addEnvVar('DATABASE_URL', CONNECTION_POOLING_URL);
    
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
    console.log('\n💡 Benefits of Connection Pooling:');
    console.log('   - Better for serverless environments (Vercel)');
    console.log('   - Supports more concurrent connections');
    console.log('   - More stable and reliable');
    
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
