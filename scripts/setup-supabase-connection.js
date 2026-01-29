// 🚀 Setup Supabase Connection Script
// Run: node scripts/setup-supabase-connection.js
// This script helps you set up DATABASE_URL for Supabase

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ENV_LOCAL_PATH = path.join(__dirname, '..', '.env.local');
const ENV_EXAMPLE_PATH = path.join(__dirname, '..', '.env.example');

// Supabase Project Info
const SUPABASE_PROJECT_ID = 'ebelbztbpzccdhytynnc';
const SUPABASE_URL = 'https://ebelbztbpzccdhytynnc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hDEEzbaiJX0-4cdeE4BVbQ_8WqAAbs5';
const SUPABASE_SERVICE_KEY = 'sb_secret_t0LnDUHEpTMSNez6PyLIqg_udKq1Zmq';

// Helper: Read user input
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

// URL encode password
function encodePassword(password) {
  return encodeURIComponent(password);
}

// Create DATABASE_URL
function createDatabaseUrl(password, usePooling = false) {
  const encodedPassword = encodePassword(password);
  
  if (usePooling) {
    // Connection Pooling URL (better for serverless)
    // Format: postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[REGION].pooler.supabase.com:6543/postgres?sslmode=require
    return `postgresql://postgres.${SUPABASE_PROJECT_ID}:${encodedPassword}@aws-0-me-central-1.pooler.supabase.com:6543/postgres?sslmode=require`;
  } else {
    // Direct Connection URL
    return `postgresql://postgres:${encodedPassword}@db.${SUPABASE_PROJECT_ID}.supabase.co:5432/postgres?sslmode=require`;
  }
}

// Update .env.local
function updateEnvLocal(databaseUrl) {
  let envContent = '';
  
  // Read existing .env.local if exists
  if (fs.existsSync(ENV_LOCAL_PATH)) {
    envContent = fs.readFileSync(ENV_LOCAL_PATH, 'utf8');
  } else {
    // Read from .env.example as template
    if (fs.existsSync(ENV_EXAMPLE_PATH)) {
      envContent = fs.readFileSync(ENV_EXAMPLE_PATH, 'utf8');
    }
  }

  // Update or add DATABASE_URL
  if (envContent.includes('DATABASE_URL=')) {
    envContent = envContent.replace(
      /DATABASE_URL=.*/,
      `DATABASE_URL=${databaseUrl}`
    );
  } else {
    envContent += `\n# Database Connection\nDATABASE_URL=${databaseUrl}\n`;
  }

  // Update or add Supabase variables
  const supabaseVars = {
    'NEXT_PUBLIC_SUPABASE_URL': SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': SUPABASE_ANON_KEY,
    'SUPABASE_SERVICE_ROLE_KEY': SUPABASE_SERVICE_KEY,
  };

  Object.entries(supabaseVars).forEach(([key, value]) => {
    if (envContent.includes(`${key}=`)) {
      envContent = envContent.replace(
        new RegExp(`${key}=.*`),
        `${key}=${value}`
      );
    } else {
      envContent += `${key}=${value}\n`;
    }
  });

  // Ensure NODE_ENV and NEXT_OUTPUT_MODE exist
  if (!envContent.includes('NODE_ENV=')) {
    envContent = 'NODE_ENV=development\n' + envContent;
  }
  if (!envContent.includes('NEXT_OUTPUT_MODE=')) {
    envContent += 'NEXT_OUTPUT_MODE=standalone\n';
  }

  fs.writeFileSync(ENV_LOCAL_PATH, envContent);
  console.log(`✅ تم تحديث .env.local في: ${ENV_LOCAL_PATH}\n`);
}

async function main() {
  console.log('🚀 ========================================');
  console.log('🚀 Supabase Connection Setup');
  console.log('🚀 ========================================\n');

  console.log('📋 معلومات Supabase:');
  console.log(`   Project ID: ${SUPABASE_PROJECT_ID}`);
  console.log(`   URL: ${SUPABASE_URL}\n`);

  // Check if password is provided as argument
  let password = process.argv[2];
  
  if (!password) {
    console.log('💡 أدخل Database Password من Supabase Dashboard');
    console.log('   Settings → Database → Database Password\n');
    password = await askQuestion('🔑 Database Password: ');
  }

  if (!password || password.trim().length === 0) {
    console.error('❌ Password مطلوب!');
    process.exit(1);
  }

  password = password.trim();

  // Use Connection Pooling (better for Supabase)
  console.log('💡 استخدام Connection Pooling (الأفضل لـ Supabase)\n');
  
  // Create DATABASE_URL with pooling
  const databaseUrl = createDatabaseUrl(password, true);
  
  console.log('\n📝 DATABASE_URL (Connection Pooling):');
  console.log(`   ${databaseUrl.replace(/:[^:@]+@/, ':****@')}\n`); // Hide password in output

  // Update .env.local
  updateEnvLocal(databaseUrl);

  console.log('✅ تم إعداد الاتصال بنجاح!\n');
  console.log('📝 الخطوات التالية:');
  console.log('   1. شغّل: npm run db:generate');
  console.log('   2. شغّل: npm run db:push (أو استخدم supabase-schema.sql)');
  console.log('   3. شغّل: npm run db:create-admin');
  console.log('   4. شغّل: npm run db:test (للتحقق من الاتصال)\n');
}

main().catch(console.error);
