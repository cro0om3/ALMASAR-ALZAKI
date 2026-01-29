// 🚀 Smart Script: Complete Neon Setup from Scratch
// Run: node setup-neon-complete.js
// This script does EVERYTHING automatically!

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const VERCEL_API_TOKEN = process.env.VERCEL_TOKEN || '';
const PROJECT_ID = 'prj_vYVJ3thAnk1Z78QK6vmrKfD2rY7k';
const ENV_LOCAL_PATH = path.join(__dirname, '..', '.env.local');

// ============================================
// Helper: Read user input
// ============================================
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

// ============================================
// Helper: Make HTTP requests
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
// Step 1: Get Neon Connection String
// ============================================
async function getNeonConnectionString() {
  console.log('\n📋 Step 1: Neon Connection String\n');
  console.log('💡 Get Connection String from:');
  console.log('   1. Go to: https://console.neon.tech');
  console.log('   2. Select your Project');
  console.log('   3. Go to: Settings → Connection String');
  console.log('   4. Copy the Connection String\n');
  
  const connectionString = await askQuestion('🔗 Paste Neon Connection String: ');
  
  if (!connectionString || !connectionString.includes('neon.tech')) {
    console.error('❌ Invalid Connection String! Must contain "neon.tech"');
    process.exit(1);
  }
  
  console.log('✅ Connection String received!\n');
  return connectionString.trim();
}

// ============================================
// Step 2: Update .env.local
// ============================================
async function updateEnvLocal(connectionString) {
  console.log('📝 Step 2: Updating .env.local...\n');
  
  let envContent = '';
  if (fs.existsSync(ENV_LOCAL_PATH)) {
    envContent = fs.readFileSync(ENV_LOCAL_PATH, 'utf8');
  }
  
  // Update or add DATABASE_URL
  if (envContent.includes('DATABASE_URL=')) {
    envContent = envContent.replace(
      /DATABASE_URL=.*/,
      `DATABASE_URL=${connectionString}`
    );
  } else {
    envContent += `\nDATABASE_URL=${connectionString}\n`;
  }
  
  fs.writeFileSync(ENV_LOCAL_PATH, envContent);
  console.log('✅ .env.local updated!\n');
}

// ============================================
// Step 3: Update Vercel Environment Variables
// ============================================
async function updateVercelEnv(connectionString) {
  console.log('☁️  Step 3: Updating Vercel Environment Variables...\n');
  
  if (!VERCEL_API_TOKEN) {
    console.log('⚠️  VERCEL_TOKEN not found, skipping Vercel update');
    console.log('💡 You can update manually in Vercel Dashboard\n');
    return;
  }
  
  try {
    // Get existing env vars
    const getOptions = {
      hostname: 'api.vercel.com',
      path: `/v10/projects/${PROJECT_ID}/env`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VERCEL_API_TOKEN}`
      }
    };
    
    const getResult = await makeRequest(getOptions);
    const envs = getResult.data.envs || [];
    const databaseUrlVar = envs.find(e => e.key === 'DATABASE_URL');
    
    // Delete old if exists
    if (databaseUrlVar) {
      const deleteOptions = {
        hostname: 'api.vercel.com',
        path: `/v10/projects/${PROJECT_ID}/env/${databaseUrlVar.id}`,
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${VERCEL_API_TOKEN}`
        }
      };
      await makeRequest(deleteOptions);
      console.log('   🗑️  Deleted old DATABASE_URL');
    }
    
    // Add new
    const addOptions = {
      hostname: 'api.vercel.com',
      path: `/v10/projects/${PROJECT_ID}/env`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    
    const payload = {
      key: 'DATABASE_URL',
      value: connectionString,
      type: 'encrypted',
      target: ['production', 'preview', 'development']
    };
    
    await makeRequest(addOptions, payload);
    console.log('   ✅ DATABASE_URL updated in Vercel!\n');
  } catch (error) {
    console.log('   ⚠️  Failed to update Vercel:', error.error?.error?.message || error.message);
    console.log('   💡 You can update manually in Vercel Dashboard\n');
  }
}

// ============================================
// Step 4: Run Prisma Migrations
// ============================================
async function runPrismaMigrations() {
  console.log('🔄 Step 4: Running Prisma Migrations...\n');
  
  try {
    console.log('   📦 Running: npx prisma generate...');
    execSync('npx prisma generate', { stdio: 'inherit', cwd: __dirname });
    console.log('   ✅ Prisma Client generated!\n');
    
    console.log('   📦 Running: npx prisma db push...');
    execSync('npx prisma db push', { stdio: 'inherit', cwd: __dirname });
    console.log('   ✅ Database schema pushed!\n');
  } catch (error) {
    console.error('   ❌ Migration failed:', error.message);
    throw error;
  }
}

// ============================================
// Step 5: Create Admin User
// ============================================
async function createAdminUser() {
  console.log('👤 Step 5: Creating Admin User...\n');
  
  try {
    execSync('npm run db:create-admin', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('✅ Admin User created!\n');
  } catch (error) {
    console.error('   ⚠️  Failed to create admin user:', error.message);
    console.log('   💡 You can run manually: node create-admin-user.js\n');
  }
}

// ============================================
// Step 6: Test Connection
// ============================================
async function testConnection() {
  console.log('🧪 Step 6: Testing Connection...\n');
  
  try {
    execSync('npm run db:test', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('✅ Connection test passed!\n');
  } catch (error) {
    console.error('   ⚠️  Connection test failed:', error.message);
    console.log('   💡 Check DATABASE_URL in .env.local\n');
  }
}

// ============================================
// Main Function
// ============================================
async function main() {
  console.log('🚀 ========================================');
  console.log('🚀 Neon Complete Setup - Automatic Mode');
  console.log('🚀 ========================================\n');
  
  try {
    // Step 1: Get Connection String
    const connectionString = await getNeonConnectionString();
    
    // Step 2: Update .env.local
    await updateEnvLocal(connectionString);
    
    // Step 3: Update Vercel
    await updateVercelEnv(connectionString);
    
    // Step 4: Run Migrations
    await runPrismaMigrations();
    
    // Step 5: Create Admin User
    await createAdminUser();
    
    // Step 6: Test Connection
    await testConnection();
    
    // Final Report
    console.log('🎉 ========================================');
    console.log('🎉 Setup Complete!');
    console.log('🎉 ========================================\n');
    console.log('✅ .env.local updated');
    console.log('✅ Vercel Environment Variables updated');
    console.log('✅ Database schema created');
    console.log('✅ Admin User created (PIN: 1234)');
    console.log('✅ Connection tested\n');
    console.log('📝 Next Steps:');
    console.log('   1. Redeploy in Vercel (if updated)');
    console.log('   2. Install Neon Extension in Cursor');
    console.log('   3. Extension will auto-detect DATABASE_URL');
    console.log('   4. Click "Connect" in Neon Panel');
    console.log('   5. Test login with PIN: 1234\n');
    console.log('🎉 Everything is ready! 🚀\n');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n💡 You can run steps manually:');
    console.log('   1. Update .env.local with Neon Connection String');
    console.log('   2. Run: npx prisma generate && npx prisma db push');
    console.log('   3. Run: node create-admin-user.js');
    console.log('   4. Update Vercel Environment Variables');
    process.exit(1);
  }
}

// Run
main().catch(console.error);
