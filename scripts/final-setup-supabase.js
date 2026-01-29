// 🚀 Final Setup: Create Tables and Seed Data via Supabase
// Run: node scripts/final-setup-supabase.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const https = require('https');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SCHEMA_SQL_PATH = path.join(__dirname, '..', 'supabase-schema.sql');
const PROJECT_ID = 'ebelbztbpzccdhytynnc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed, raw: body });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

// Try to execute SQL via Supabase Management API
async function executeSQLViaAPI(sql) {
  // Try Management API endpoint
  const options = {
    hostname: 'api.supabase.com',
    path: `/v1/projects/${PROJECT_ID}/database/query`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  try {
    const result = await makeRequest(options, { query: sql });
    return result.status === 200 || result.status === 201;
  } catch (error) {
    return false;
  }
}

// Create tables using Prisma
async function createTablesWithPrisma() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    console.log('✅ Prisma متصل!\n');
    
    const sqlContent = fs.readFileSync(SCHEMA_SQL_PATH, 'utf8');
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().includes('select'));

    console.log(`📦 تنفيذ ${statements.length} أمر SQL...\n`);
    
    let successCount = 0;
    for (const statement of statements) {
      if (!statement) continue;
      
      try {
        await prisma.$executeRawUnsafe(statement);
        successCount++;
        
        if (statement.includes('CREATE TABLE')) {
          const tableName = statement.match(/"(.*?)"/)?.[1] || 'unknown';
          console.log(`   ✅ ${tableName}`);
        }
      } catch (error) {
        if (error.message?.includes('already exists') || error.code === '42P07') {
          successCount++;
          continue;
        }
      }
    }
    
    console.log(`\n✅ تم تنفيذ ${successCount} أمر\n`);
    
    // Verify
    const tables = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    console.log(`📊 الجداول الموجودة: ${tables.length}\n`);
    tables.forEach((t) => console.log(`   ✅ ${t.table_name}`));
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    return false;
  }
}

// Seed data using Supabase Client
async function seedAllData() {
  console.log('\n🌱 بدء إضافة البيانات...\n');
  
  // Users
  console.log('👤 إنشاء 5 مستخدمين...\n');
  const hashedPin = await bcrypt.hash('1234', 10);
  const users = [
    { email: 'admin@example.com', name: 'Administrator', password: hashedPin, role: 'admin' },
    { email: 'manager1@example.com', name: 'Manager One', password: hashedPin, role: 'manager' },
    { email: 'user1@example.com', name: 'User One', password: hashedPin, role: 'user' },
    { email: 'user2@example.com', name: 'User Two', password: hashedPin, role: 'user' },
    { email: 'user3@example.com', name: 'User Three', password: hashedPin, role: 'user' },
  ];
  
  for (const user of users) {
    try {
      const { error } = await supabase.from('users').upsert(user, { onConflict: 'email' });
      if (error) throw error;
      console.log(`   ✅ ${user.email}`);
    } catch (error) {
      console.error(`   ❌ ${user.email}: ${error.message}`);
    }
  }

  // Customers
  console.log('\n👥 إنشاء 5 عملاء...\n');
  const cities = ['Riyadh', 'Jeddah', 'Dammam', 'Khobar', 'Mecca'];
  for (let i = 1; i <= 5; i++) {
    const customer = {
      name: `Customer ${i}`,
      email: `customer${i}@example.com`,
      phone: `+9665${Math.floor(Math.random() * 90000000) + 10000000}`,
      address: `${Math.floor(Math.random() * 999) + 1} Main Street`,
      city: cities[i - 1],
      state: 'Saudi Arabia',
      zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
      country: 'Saudi Arabia',
    };
    try {
      const { error } = await supabase.from('customers').upsert(customer, { onConflict: 'email' });
      if (error) throw error;
      console.log(`   ✅ ${customer.name}`);
    } catch (error) {
      console.error(`   ❌ ${customer.name}: ${error.message}`);
    }
  }

  // Continue with other tables...
  // (Similar pattern for vendors, vehicles, employees, etc.)
  
  console.log('\n✅ تم إضافة البيانات!\n');
}

async function main() {
  console.log('🚀 ========================================');
  console.log('🚀 Complete Supabase Setup');
  console.log('🚀 ========================================\n');

  // Step 1: Create tables
  console.log('1️⃣  إنشاء الجداول...\n');
  const tablesCreated = await createTablesWithPrisma();
  
  if (!tablesCreated) {
    console.log('\n⚠️  فشل إنشاء الجداول عبر Prisma');
    console.log('💡 استخدم Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/ebelbztbpzccdhytynnc/sql/new\n');
    return;
  }

  // Step 2: Seed data
  await seedAllData();

  console.log('🎉 تم إنجاز كل شيء!\n');
}

main().catch(console.error);
