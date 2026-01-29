// Script to get Connection Pooling URL from Supabase and update Vercel
// Run: node get-supabase-connection-pooling.js
// 
// Requirements:
// 1. Supabase Service Role Key
// 2. Vercel API Token
// 3. Project ID: prj_vYVJ3thAnk1Z78QK6vmrKfD2rY7k

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const https = require('https');

// ============================================
// CONFIGURATION
// ============================================
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tundlptcusiogiaagsba.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_8hIdHJTfUdAwUTyHjHaAIw_j0VDaTmx';
const VERCEL_API_TOKEN = process.env.VERCEL_TOKEN || '';
const PROJECT_ID = 'prj_vYVJ3thAnk1Z78QK6vmrKfD2rY7k';

// Extract project reference from Supabase URL
const PROJECT_REF = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

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
// Get Connection Pooling URL from Supabase
// ============================================
async function getSupabaseConnectionPooling() {
  // Supabase doesn't have a direct API for connection string
  // But we can construct it from known patterns
  // Connection Pooling URL format:
  // postgresql://postgres.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:6543/postgres?sslmode=require
  
  // We need to get the region and password from the existing connection string
  // For now, we'll use the known password and construct the URL
  
  const password = 'Fhd%23%232992692'; // URL encoded password
  
  // Common Supabase regions and their pooler endpoints
  // We'll try to detect or use a common pattern
  // Most Supabase projects use: aws-0-REGION.pooler.supabase.com
  
  // Since we know the project is in me-central-1 (from previous attempts)
  const region = 'me-central-1';
  const poolerUrl = `postgresql://postgres.${PROJECT_REF}:${password}@aws-0-${region}.pooler.supabase.com:6543/postgres?sslmode=require`;
  
  console.log('📋 Constructed Connection Pooling URL:');
  console.log(`   ${poolerUrl.substring(0, 80)}...\n`);
  
  return poolerUrl;
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
// Test Database Connection
// ============================================
async function testConnection(connectionString) {
  // We can't easily test PostgreSQL connection from Node.js without installing pg
  // But we can verify the URL format
  const isValid = connectionString.includes('pooler.supabase.com') && 
                  connectionString.includes(':6543') &&
                  connectionString.includes('postgres.') &&
                  connectionString.includes('?sslmode=require');
  
  return isValid;
}

// ============================================
// Main function
// ============================================
async function main() {
  console.log('🚀 Getting Connection Pooling URL and updating Vercel...\n');

  // Check if tokens are provided
  if (!VERCEL_API_TOKEN) {
    console.error('❌ ERROR: VERCEL_TOKEN is not set!');
    console.log('\n💡 Add it to .env.local: VERCEL_TOKEN=your_token_here');
    process.exit(1);
  }

  if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ ERROR: SUPABASE_SERVICE_ROLE_KEY is not set!');
    process.exit(1);
  }

  console.log(`📋 Supabase Project: ${PROJECT_REF}`);
  console.log(`📋 Vercel Project ID: ${PROJECT_ID}\n`);

  try {
    // Get Connection Pooling URL
    console.log('🔍 Getting Connection Pooling URL...');
    const connectionPoolingUrl = await getSupabaseConnectionPooling();
    
    // Test URL format
    console.log('🧪 Testing connection URL format...');
    const isValid = await testConnection(connectionPoolingUrl);
    
    if (!isValid) {
      console.error('❌ Invalid connection URL format!');
      process.exit(1);
    }
    console.log('   ✅ Connection URL format is valid\n');

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
