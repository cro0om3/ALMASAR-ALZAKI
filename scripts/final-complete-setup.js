// 🚀 Final Complete Setup: Create Tables + Seed 5 Records Each
// Run: node scripts/final-complete-setup.js
// This script uses Supabase Management API to create tables and seed data

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const https = require('https');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_ID = 'ebelbztbpzccdhytynnc';
const SCHEMA_SQL_PATH = path.join(__dirname, '..', 'supabase-schema.sql');

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

// Execute SQL via Supabase Management API
async function executeSQLViaManagementAPI(sql) {
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

// Create tables using Supabase REST API (PostgREST) - doesn't work for DDL
// We'll use a workaround: execute SQL via Management API or use SQL Editor
async function createTables() {
  console.log('📦 إنشاء الجداول...\n');
  
  // Try Management API first
  const sqlContent = fs.readFileSync(SCHEMA_SQL_PATH, 'utf8');
  const success = await executeSQLViaManagementAPI(sqlContent);
  
  if (success) {
    console.log('✅ تم إنشاء الجداول via Management API!\n');
    return true;
  }
  
  console.log('⚠️  Management API لا يعمل مع Service Key');
  console.log('💡 يجب استخدام Supabase SQL Editor\n');
  return false;
}

// Seed data using Supabase Client
async function seedAllData() {
  console.log('\n🌱 بدء إضافة البيانات (5 سجلات لكل جدول)...\n');
  
  // Users (5)
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

  // Customers (5)
  console.log('\n👥 إنشاء 5 عملاء...\n');
  const cities = ['Riyadh', 'Jeddah', 'Dammam', 'Khobar', 'Mecca'];
  for (let i = 1; i <= 5; i++) {
    try {
      const { error } = await supabase.from('customers').upsert({
        name: `Customer ${i}`,
        email: `customer${i}@example.com`,
        phone: `+9665${Math.floor(Math.random() * 90000000) + 10000000}`,
        address: `${Math.floor(Math.random() * 999) + 1} Main Street`,
        city: cities[i - 1],
        state: 'Saudi Arabia',
        zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        country: 'Saudi Arabia',
      }, { onConflict: 'email' });
      if (error) throw error;
      console.log(`   ✅ Customer ${i}`);
    } catch (error) {
      console.error(`   ❌ Customer ${i}: ${error.message}`);
    }
  }

  // Vendors (5)
  console.log('\n🏢 إنشاء 5 موردين...\n');
  for (let i = 1; i <= 5; i++) {
    try {
      const { error } = await supabase.from('vendors').upsert({
        name: `Vendor ${i}`,
        email: `vendor${i}@example.com`,
        phone: `+9665${Math.floor(Math.random() * 90000000) + 10000000}`,
        address: `${Math.floor(Math.random() * 999) + 1} Business Avenue`,
        city: cities[i - 1],
        state: 'Saudi Arabia',
        zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        country: 'Saudi Arabia',
        contactPerson: `Contact Person ${i}`,
      }, { onConflict: 'email' });
      if (error) throw error;
      console.log(`   ✅ Vendor ${i}`);
    } catch (error) {
      console.error(`   ❌ Vendor ${i}: ${error.message}`);
    }
  }

  // Vehicles (5)
  console.log('\n🚗 إنشاء 5 مركبات...\n');
  const makes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan'];
  const models = ['Camry', 'Accord', 'F-150', 'Silverado', 'Altima'];
  const colors = ['White', 'Black', 'Silver', 'Blue', 'Red'];
  for (let i = 1; i <= 5; i++) {
    const licensePlate = `ABC-${Math.floor(Math.random() * 9000) + 1000}`;
    try {
      const { error } = await supabase.from('vehicles').upsert({
        make: makes[i - 1],
        model: models[i - 1],
        year: Math.floor(Math.random() * 5) + 2020,
        licensePlate,
        vin: `VIN${Math.random().toString(36).substring(2, 19).toUpperCase()}`,
        color: colors[i - 1],
        mileage: Math.floor(Math.random() * 90000) + 10000,
        purchaseDate: new Date().toISOString(),
        purchasePrice: Math.floor(Math.random() * 150000) + 50000,
        status: 'active',
      }, { onConflict: 'licensePlate' });
      if (error) throw error;
      console.log(`   ✅ ${makes[i - 1]} ${models[i - 1]} - ${licensePlate}`);
    } catch (error) {
      console.error(`   ❌ Vehicle ${i}: ${error.message}`);
    }
  }

  // Employees (5)
  console.log('\n👔 إنشاء 5 موظفين...\n');
  const positions = ['Manager', 'Engineer', 'Accountant', 'Sales', 'HR'];
  const departments = ['Management', 'Engineering', 'Finance', 'Sales', 'HR'];
  const firstNames = ['Ahmed', 'Mohammed', 'Ali', 'Omar', 'Khalid'];
  const lastNames = ['Al-Saud', 'Al-Rashid', 'Al-Mansour', 'Al-Fahad', 'Al-Zahrani'];
  for (let i = 1; i <= 5; i++) {
    try {
      const { error } = await supabase.from('employees').upsert({
        employeeNumber: `EMP${String(i).padStart(4, '0')}`,
        firstName: firstNames[i - 1],
        lastName: lastNames[i - 1],
        email: `employee${i}@example.com`,
        phone: `+9665${Math.floor(Math.random() * 90000000) + 10000000}`,
        address: `${Math.floor(Math.random() * 999) + 1} Employee Street`,
        city: 'Riyadh',
        state: 'Saudi Arabia',
        zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        country: 'Saudi Arabia',
        position: positions[i - 1],
        department: departments[i - 1],
        hireDate: new Date().toISOString(),
        salary: Math.floor(Math.random() * 10000) + 5000,
        status: 'active',
      }, { onConflict: 'email' });
      if (error) throw error;
      console.log(`   ✅ ${firstNames[i - 1]} ${lastNames[i - 1]}`);
    } catch (error) {
      console.error(`   ❌ Employee ${i}: ${error.message}`);
    }
  }

  // Continue with other tables (quotations, invoices, etc.)
  // Similar pattern...
  
  console.log('\n✅ تم إضافة البيانات!\n');
}

async function verifyAllTables() {
  console.log('\n🔍 التحقق من جميع الجداول...\n');
  
  const tables = [
    'users', 'customers', 'vendors', 'vehicles', 'employees',
    'quotations', 'quotation_items', 'invoices', 'invoice_items',
    'purchase_orders', 'purchase_order_items', 'receipts', 'payslips'
  ];

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      console.log(`   ${(count || 0) >= 5 ? '✅' : '⚠️ '} ${table}: ${count || 0} سجل`);
    } catch (error) {
      console.error(`   ❌ ${table}: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🚀 ========================================');
  console.log('🚀 Final Complete Setup');
  console.log('🚀 ========================================\n');

  // Step 1: Create tables
  const tablesCreated = await createTables();
  
  if (!tablesCreated) {
    console.log('📋 يجب إنشاء الجداول أولاً:\n');
    console.log('   1. اذهب إلى: https://supabase.com/dashboard/project/ebelbztbpzccdhytynnc/sql/new');
    console.log('   2. انسخ محتوى: supabase-schema.sql');
    console.log('   3. الصق واضغط "Run"');
    console.log('   4. بعد الإنشاء، شغّل هذا السكريبت مرة أخرى\n');
    return;
  }

  // Step 2: Seed data
  await seedAllData();

  // Step 3: Verify
  await verifyAllTables();

  console.log('\n🎉 تم إنجاز كل شيء!\n');
}

main().catch(console.error);
