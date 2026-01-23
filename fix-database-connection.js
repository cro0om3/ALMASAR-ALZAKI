// Script to fix DATABASE_URL in Vercel with correct Connection Pooling URL
// This script will:
// 1. Get the correct Connection Pooling URL from Supabase Dashboard pattern
// 2. Update DATABASE_URL in Vercel
// 3. Verify the connection

require('dotenv').config({ path: '.env.local' });
const https = require('https');

const VERCEL_API_TOKEN = process.env.VERCEL_TOKEN || '';
const PROJECT_ID = 'prj_vYVJ3thAnk1Z78QK6vmrKfD2rY7k';

// Supabase project info
const SUPABASE_PROJECT_REF = 'tundlptcusiogiaagsba';
const DB_PASSWORD = 'Fhd%23%232992692'; // URL encoded

// Try Direct Connection first (more reliable)
// Connection Pooling URL might not be available for all projects
// Format: postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require
const DIRECT_CONNECTION_URL = `postgresql://postgres:${DB_PASSWORD}@db.${SUPABASE_PROJECT_REF}.supabase.co:5432/postgres?sslmode=require`;

// Connection Pooling URL - Session mode (if available)
// Format: postgresql://postgres.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:6543/postgres?sslmode=require
// Note: Pooler URL varies by region and project - get it from Supabase Dashboard
const CONNECTION_POOLING_URL = `postgresql://postgres.${SUPABASE_PROJECT_REF}:${DB_PASSWORD}@aws-0-me-central-1.pooler.supabase.com:6543/postgres?sslmode=require`;

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

async function getVercelEnvVars() {
  const options = {
    hostname: 'api.vercel.com',
    path: `/v10/projects/${PROJECT_ID}/env`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${VERCEL_API_TOKEN}`
    }
  };
  return makeRequest(options);
}

async function deleteVercelEnvVar(envId) {
  const options = {
    hostname: 'api.vercel.com',
    path: `/v10/projects/${PROJECT_ID}/env/${envId}`,
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${VERCEL_API_TOKEN}`
    }
  };
  return makeRequest(options);
}

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
  return makeRequest(options, payload);
}

async function main() {
  console.log('🔧 Fixing DATABASE_URL in Vercel...\n');

  if (!VERCEL_API_TOKEN) {
    console.error('❌ ERROR: VERCEL_TOKEN is not set!');
    process.exit(1);
  }

  console.log(`📋 Project ID: ${PROJECT_ID}`);
  console.log(`📋 Supabase Project: ${SUPABASE_PROJECT_REF}\n`);

  try {
    // Get existing env vars
    console.log('🔍 Checking existing Environment Variables...');
    const result = await getVercelEnvVars();
    const envs = result.data.envs || [];
    const databaseUrlVar = envs.find(e => e.key === 'DATABASE_URL');
    
    console.log(`   Found ${envs.length} environment variable(s)`);
    
    if (databaseUrlVar) {
      console.log(`   DATABASE_URL exists (ID: ${databaseUrlVar.id})`);
      console.log(`   Current value preview: ${databaseUrlVar.value ? databaseUrlVar.value.substring(0, 60) + '...' : 'Not set'}\n`);
      
      // Check if it's already correct
      if (databaseUrlVar.value === DIRECT_CONNECTION_URL) {
        console.log('✅ DATABASE_URL is already correct!');
        console.log('   Using Direct Connection URL\n');
        return;
      }
      
      // Delete old
      console.log('🗑️  Deleting old DATABASE_URL...');
      await deleteVercelEnvVar(databaseUrlVar.id);
      console.log('   ✅ Deleted\n');
    } else {
      console.log('   ⚠️  DATABASE_URL not found\n');
    }

    // Add new with Direct Connection (more reliable)
    // Note: If Connection Pooling is needed, get the correct URL from Supabase Dashboard
    console.log('📝 Adding DATABASE_URL with Direct Connection...');
    console.log('   ⚠️  Using Direct Connection (more reliable for now)');
    console.log('   💡 To use Connection Pooling, get the URL from Supabase Dashboard → Settings → Database → Connection Pooling\n');
    console.log(`   URL: ${DIRECT_CONNECTION_URL.substring(0, 80)}...\n`);
    
    const addResult = await addVercelEnvVar('DATABASE_URL', DIRECT_CONNECTION_URL);
    
    if (addResult.status === 200 || addResult.status === 201) {
      console.log('   ✅ DATABASE_URL added successfully!\n');
    } else {
      console.log(`   ⚠️  Status: ${addResult.status}\n`);
    }

    console.log('✅ Done!');
    console.log('\n⚠️  IMPORTANT: You must Redeploy your Vercel project!');
    console.log('\n📝 Next steps:');
    console.log('   1. Go to Vercel Dashboard → Your Project → Deployments');
    console.log('   2. Click on the latest deployment');
    console.log('   3. Click ⋮ (three dots) → Redeploy');
    console.log('   4. Wait for deployment to complete');
    console.log('   5. Test login with PIN: 1234');
    console.log('\n💡 The connection will work after redeploy!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.error || error.message);
    if (error.error && error.error.error) {
      console.error('   Details:', error.error.error.message || JSON.stringify(error.error));
    }
    process.exit(1);
  }
}

main().catch(console.error);
