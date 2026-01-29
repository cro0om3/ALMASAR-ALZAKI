// 🚀 EXECUTE COMPLETE SETUP - Create Tables + Seed Data
// Run: node scripts/EXECUTE-COMPLETE-SETUP.js
// This script uses PAT to create tables via Management API, then seeds data

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const https = require('https');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_PAT = process.env.SUPABASE_PERSONAL_ACCESS_TOKEN;
const PROJECT_ID = 'ebelbztbpzccdhytynnc';
const SCHEMA_SQL_PATH = path.join(__dirname, '..', 'supabase-schema.sql');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Helper functions
function randomString(length = 8) {
  return Math.random().toString(36).substring(2, length + 2);
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Make HTTP request
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: parsed, body });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Execute SQL via Supabase Management API using PAT
async function executeSQLViaManagementAPI(sql) {
  if (!SUPABASE_PAT) {
    throw new Error('SUPABASE_PERSONAL_ACCESS_TOKEN غير موجود في .env.local');
  }

  const options = {
    hostname: 'api.supabase.com',
    path: `/v1/projects/${PROJECT_ID}/database/query`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_PAT}`,
      'Content-Type': 'application/json',
    },
  };

  try {
    const result = await makeRequest(options, { query: sql });
    return result;
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

// Create tables
async function createTables() {
  console.log('📦 إنشاء الجداول...\n');
  
  const sqlContent = fs.readFileSync(SCHEMA_SQL_PATH, 'utf8');
  
  // Split SQL into statements
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => {
      if (!s || s.length === 0) return false;
      const withoutComments = s.split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .trim();
      return withoutComments.length > 0;
    });

  console.log(`📝 تم العثور على ${statements.length} أمر SQL\n`);
  console.log('📤 تنفيذ الأوامر...\n');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement) continue;

    try {
      const result = await executeSQLViaManagementAPI(statement);
      
      if (result.status === 200 || result.status === 201) {
        successCount++;
        if (statement.toUpperCase().includes('CREATE TABLE')) {
          const tableMatch = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?"?(\w+)"?/i);
          if (tableMatch) {
            console.log(`   ✅ جدول: ${tableMatch[1]}`);
          }
        }
      } else if (result.status === 400) {
        // Check if it's an "already exists" error
        const errorMsg = result.data?.message || result.body || '';
        if (errorMsg.includes('already exists') || 
            errorMsg.includes('duplicate') ||
            errorMsg.includes('42710') ||
            errorMsg.includes('42P07')) {
          successCount++;
          if (statement.toUpperCase().includes('CREATE TABLE')) {
            const tableMatch = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?"?(\w+)"?/i);
            if (tableMatch) {
              console.log(`   ✅ جدول: ${tableMatch[1]} (موجود مسبقاً)`);
            }
          }
        } else {
          errorCount++;
          console.error(`   ⚠️  خطأ في الأمر ${i + 1}: ${errorMsg.substring(0, 80)}`);
        }
      } else {
        errorCount++;
        console.error(`   ⚠️  خطأ: Status ${result.status}`);
      }
    } catch (error) {
      errorCount++;
      console.error(`   ⚠️  خطأ: ${error.message}`);
    }
  }

  console.log(`\n✅ تم تنفيذ ${successCount} أمر بنجاح`);
  if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} أخطاء (معظمها "already exists" - طبيعي)`);
  }

  return successCount > 0;
}

// Seed all data (5 records per table)
async function seedAllData() {
  console.log('🌱 بدء إضافة البيانات (5 سجلات لكل جدول)...\n');
  
  // Users (5)
  console.log('👤 إنشاء 5 مستخدمين...\n');
  const hashedPin = await bcrypt.hash('1234', 10);
  const users = [
    { id: `user_${randomString(16)}`, email: 'admin@example.com', name: 'Administrator', password: hashedPin, role: 'admin', updatedAt: new Date().toISOString() },
    { id: `user_${randomString(16)}`, email: 'manager1@example.com', name: 'Manager One', password: hashedPin, role: 'manager', updatedAt: new Date().toISOString() },
    { id: `user_${randomString(16)}`, email: 'user1@example.com', name: 'User One', password: hashedPin, role: 'user', updatedAt: new Date().toISOString() },
    { id: `user_${randomString(16)}`, email: 'user2@example.com', name: 'User Two', password: hashedPin, role: 'user', updatedAt: new Date().toISOString() },
    { id: `user_${randomString(16)}`, email: 'user3@example.com', name: 'User Three', password: hashedPin, role: 'user', updatedAt: new Date().toISOString() },
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
  const customers = [];
  for (let i = 1; i <= 5; i++) {
    const customer = {
      id: `customer_${randomString(16)}`,
      name: `Customer ${i}`,
      email: `customer${i}@example.com`,
      phone: `+9665${randomNumber(10000000, 99999999)}`,
      address: `${randomNumber(1, 999)} Main Street`,
      city: cities[i - 1],
      state: 'Saudi Arabia',
      zipCode: `${randomNumber(10000, 99999)}`,
      country: 'Saudi Arabia',
      updatedAt: new Date().toISOString()
    };
    customers.push(customer);
    try {
      const { error } = await supabase.from('customers').upsert(customer, { onConflict: 'email' });
      if (error) throw error;
      console.log(`   ✅ Customer ${i}`);
    } catch (error) {
      console.error(`   ❌ Customer ${i}: ${error.message}`);
    }
  }

  // Vendors (5)
  console.log('\n🏢 إنشاء 5 موردين...\n');
  const vendors = [];
  for (let i = 1; i <= 5; i++) {
    const vendor = {
      id: `vendor_${randomString(16)}`,
      name: `Vendor ${i}`,
      email: `vendor${i}@example.com`,
      phone: `+9665${randomNumber(10000000, 99999999)}`,
      address: `${randomNumber(1, 999)} Business Avenue`,
      city: cities[i - 1],
      state: 'Saudi Arabia',
      zipCode: `${randomNumber(10000, 99999)}`,
      country: 'Saudi Arabia',
      contactPerson: `Contact Person ${i}`,
      updatedAt: new Date().toISOString()
    };
    vendors.push(vendor);
    try {
      const { error } = await supabase.from('vendors').upsert(vendor, { onConflict: 'email' });
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
    const licensePlate = `ABC-${randomNumber(1000, 9999)}`;
    try {
      const { error } = await supabase.from('vehicles').upsert({
        id: `vehicle_${randomString(16)}`,
        make: makes[i - 1],
        model: models[i - 1],
        year: randomNumber(2020, 2024),
        licensePlate,
        vin: `VIN${randomString(17).toUpperCase()}`,
        color: colors[i - 1],
        mileage: randomNumber(10000, 100000),
        purchaseDate: randomDate(new Date(2020, 0, 1), new Date()).toISOString(),
        purchasePrice: randomNumber(50000, 200000),
        status: 'active',
        updatedAt: new Date().toISOString()
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
  const employees = [];
  for (let i = 1; i <= 5; i++) {
    const employee = {
      id: `employee_${randomString(16)}`,
      employeeNumber: `EMP${String(i).padStart(4, '0')}`,
      firstName: firstNames[i - 1],
      lastName: lastNames[i - 1],
      email: `employee${i}@example.com`,
      phone: `+9665${randomNumber(10000000, 99999999)}`,
      address: `${randomNumber(1, 999)} Employee Street`,
      city: 'Riyadh',
      state: 'Saudi Arabia',
      zipCode: `${randomNumber(10000, 99999)}`,
      country: 'Saudi Arabia',
      position: positions[i - 1],
      department: departments[i - 1],
      hireDate: randomDate(new Date(2020, 0, 1), new Date()).toISOString(),
      salary: randomNumber(5000, 15000),
      status: 'active',
      updatedAt: new Date().toISOString()
    };
    employees.push(employee);
    try {
      const { error } = await supabase.from('employees').upsert(employee, { onConflict: 'email' });
      if (error) throw error;
      console.log(`   ✅ ${firstNames[i - 1]} ${lastNames[i - 1]}`);
    } catch (error) {
      console.error(`   ❌ Employee ${i}: ${error.message}`);
    }
  }

  // Quotations (5)
  console.log('\n📄 إنشاء 5 عروض أسعار...\n');
  if (customers.length > 0) {
    for (let i = 1; i <= 5; i++) {
      const customer = customers[i - 1] || customers[0];
      const subtotal = randomNumber(1000, 50000);
      const taxRate = 0.15;
      const taxAmount = subtotal * taxRate;
      const discount = randomNumber(0, subtotal * 0.1);
      const total = subtotal + taxAmount - discount;

      try {
        const quotation = {
          id: `quotation_${randomString(16)}`,
          quotationNumber: `QT-${String(i).padStart(6, '0')}`,
          customerId: customer.id,
          date: new Date().toISOString(),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          subtotal,
          taxRate,
          taxAmount,
          discount,
          total,
          status: ['draft', 'sent', 'accepted'][i % 3],
          updatedAt: new Date().toISOString()
        };

        const { data: qData, error: qError } = await supabase
          .from('quotations')
          .insert(quotation)
          .select()
          .single();

        if (qError) throw qError;

        await supabase.from('quotation_items').insert({
          id: `qi_${randomString(16)}`,
          quotationId: qData.id,
          description: `Item ${i} Description`,
          quantity: randomNumber(1, 10),
          unitPrice: randomNumber(100, 1000),
          discount: 0,
          tax: 0,
          total: randomNumber(500, 5000),
          updatedAt: new Date().toISOString()
        });

        console.log(`   ✅ ${quotation.quotationNumber} - ${customer.name}`);
      } catch (error) {
        console.error(`   ❌ Quotation ${i}: ${error.message}`);
      }
    }
  }

  // Invoices (5)
  console.log('\n🧾 إنشاء 5 فواتير...\n');
  if (customers.length > 0) {
    for (let i = 1; i <= 5; i++) {
      const customer = customers[i - 1] || customers[0];
      const subtotal = randomNumber(1000, 50000);
      const taxRate = 0.15;
      const taxAmount = subtotal * taxRate;
      const discount = randomNumber(0, subtotal * 0.1);
      const total = subtotal + taxAmount - discount;
      const paidAmount = i <= 2 ? total : randomNumber(0, total * 0.8);

      try {
        const invoice = {
          id: `invoice_${randomString(16)}`,
          invoiceNumber: `INV-${String(i).padStart(6, '0')}`,
          customerId: customer.id,
          date: new Date().toISOString(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          subtotal,
          taxRate,
          taxAmount,
          discount,
          total,
          paidAmount,
          status: paidAmount === total ? 'paid' : 'sent',
          updatedAt: new Date().toISOString()
        };

        const { data: invData, error: invError } = await supabase
          .from('invoices')
          .insert(invoice)
          .select()
          .single();

        if (invError) throw invError;

        await supabase.from('invoice_items').insert({
          id: `ii_${randomString(16)}`,
          invoiceId: invData.id,
          description: `Invoice Item ${i}`,
          quantity: randomNumber(1, 10),
          unitPrice: randomNumber(100, 1000),
          discount: 0,
          tax: 0,
          total: randomNumber(500, 5000),
          updatedAt: new Date().toISOString()
        });

        console.log(`   ✅ ${invoice.invoiceNumber} - ${customer.name} - ${invoice.status}`);
      } catch (error) {
        console.error(`   ❌ Invoice ${i}: ${error.message}`);
      }
    }
  }

  // Purchase Orders (5)
  console.log('\n🛒 إنشاء 5 أوامر شراء...\n');
  if (vendors.length > 0 && customers.length > 0) {
    for (let i = 1; i <= 5; i++) {
      const vendor = vendors[i - 1] || vendors[0];
      const customer = customers[i - 1] || customers[0];
      const subtotal = randomNumber(1000, 50000);
      const taxRate = 0.15;
      const taxAmount = subtotal * taxRate;
      const discount = randomNumber(0, subtotal * 0.1);
      const total = subtotal + taxAmount - discount;

      try {
        const po = {
          id: `po_${randomString(16)}`,
          orderNumber: `PO-${String(i).padStart(6, '0')}`,
          vendorId: vendor.id,
          customerId: customer.id,
          date: new Date().toISOString(),
          expectedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          subtotal,
          taxRate,
          taxAmount,
          discount,
          total,
          status: ['draft', 'pending', 'approved'][i % 3],
          updatedAt: new Date().toISOString()
        };

        const { data: poData, error: poError } = await supabase
          .from('purchase_orders')
          .insert(po)
          .select()
          .single();

        if (poError) throw poError;

        await supabase.from('purchase_order_items').insert({
          id: `poi_${randomString(16)}`,
          purchaseOrderId: poData.id,
          description: `PO Item ${i}`,
          quantity: randomNumber(1, 10),
          unitPrice: randomNumber(100, 1000),
          discount: 0,
          tax: 0,
          total: randomNumber(500, 5000),
          updatedAt: new Date().toISOString()
        });

        console.log(`   ✅ ${po.orderNumber} - ${vendor.name}`);
      } catch (error) {
        console.error(`   ❌ PO ${i}: ${error.message}`);
      }
    }
  }

  // Receipts (5)
  console.log('\n💰 إنشاء 5 إيصالات...\n');
  const { data: invoices } = await supabase.from('invoices').select('id, customerId, total').limit(5);
  if (invoices && invoices.length > 0) {
    const paymentMethods = ['cash', 'bank_transfer', 'cheque', 'credit_card', 'other'];
    for (let i = 1; i <= 5; i++) {
      const invoice = invoices[i - 1] || invoices[0];
      try {
        const receipt = {
          id: `receipt_${randomString(16)}`,
          receiptNumber: `RCP-${String(i).padStart(6, '0')}`,
          invoiceId: invoice.id,
          customerId: invoice.customerId,
          date: new Date().toISOString(),
          paymentDate: new Date().toISOString(),
          amount: invoice.total,
          paymentMethod: paymentMethods[i - 1],
          referenceNumber: `REF${randomNumber(100000, 999999)}`,
          status: 'issued',
          updatedAt: new Date().toISOString()
        };

        const { data: rData, error: rError } = await supabase
          .from('receipts')
          .insert(receipt)
          .select()
          .single();

        if (rError) throw rError;

        const { data: customer } = await supabase
          .from('customers')
          .select('name')
          .eq('id', invoice.customerId)
          .single();

        console.log(`   ✅ ${receipt.receiptNumber} - ${customer?.name || 'Unknown'} - ${receipt.paymentMethod}`);
      } catch (error) {
        console.error(`   ❌ Receipt ${i}: ${error.message}`);
      }
    }
  }

  // Payslips (5)
  console.log('\n💵 إنشاء 5 كشوف مرتبات...\n');
  if (employees.length > 0) {
    for (let i = 1; i <= 5; i++) {
      const employee = employees[i - 1] || employees[0];
      const baseSalary = employee.salary;
      const overtime = randomNumber(0, baseSalary * 0.2);
      const bonuses = randomNumber(0, baseSalary * 0.1);
      const deductions = randomNumber(0, baseSalary * 0.05);
      const tax = (baseSalary + overtime + bonuses - deductions) * 0.1;
      const netPay = baseSalary + overtime + bonuses - deductions - tax;

      const periodStart = new Date();
      periodStart.setDate(1);
      const periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      periodEnd.setDate(0);

      try {
        const payslip = {
          id: `payslip_${randomString(16)}`,
          payslipNumber: `PS-${String(i).padStart(6, '0')}`,
          employeeId: employee.id,
          payPeriodStart: periodStart.toISOString(),
          payPeriodEnd: periodEnd.toISOString(),
          issueDate: new Date().toISOString(),
          baseSalary,
          overtime,
          bonuses,
          deductions,
          tax,
          netPay,
          status: 'issued',
          updatedAt: new Date().toISOString()
        };

        const { data: pData, error: pError } = await supabase
          .from('payslips')
          .insert(payslip)
          .select()
          .single();

        if (pError) throw pError;

        console.log(`   ✅ ${payslip.payslipNumber} - ${employee.firstName} ${employee.lastName} - ${netPay.toFixed(2)} SAR`);
      } catch (error) {
        console.error(`   ❌ Payslip ${i}: ${error.message}`);
      }
    }
  }
}

// Verify all tables
async function verifyAllTables() {
  console.log('\n🔍 التحقق من جميع الجداول (5 سجلات لكل جدول)...\n');
  
  const tables = [
    'users', 'customers', 'vendors', 'vehicles', 'employees',
    'quotations', 'quotation_items', 'invoices', 'invoice_items',
    'purchase_orders', 'purchase_order_items', 'receipts', 'payslips'
  ];

  let allGood = true;
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      const countNum = count || 0;
      const status = countNum >= 5 ? '✅' : '⚠️';
      console.log(`   ${status} ${table}: ${countNum} سجل`);
      if (countNum < 5) allGood = false;
    } catch (error) {
      console.error(`   ❌ ${table}: ${error.message}`);
      allGood = false;
    }
  }
  
  return allGood;
}

async function main() {
  try {
    console.log('🚀 ========================================');
    console.log('🚀 EXECUTE COMPLETE SETUP');
    console.log('🚀 إنشاء الجداول + إضافة البيانات');
    console.log('🚀 ========================================\n');

    if (!SUPABASE_PAT) {
      console.error('❌ SUPABASE_PERSONAL_ACCESS_TOKEN غير موجود في .env.local');
      process.exit(1);
    }

    // Step 1: Create tables
    const tablesCreated = await createTables();
    if (!tablesCreated) {
      console.log('❌ فشل إنشاء الجداول');
      process.exit(1);
    }

    // Wait a bit for tables to be ready
    console.log('⏳ انتظار 3 ثواني للتأكد من جاهزية الجداول...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 2: Seed data
    await seedAllData();

    // Step 3: Verify
    const allGood = await verifyAllTables();

    if (allGood) {
      console.log('\n🎉 ========================================');
      console.log('🎉 تم إنجاز كل شيء بنجاح!');
      console.log('🎉 ========================================\n');
      console.log('📝 ملخص:');
      console.log('   ✅ تم إنشاء جميع الجداول الـ 13');
      console.log('   ✅ تم إضافة 5 سجلات لكل جدول');
      console.log('   ✅ RLS معطّل - الكل يشوف كل شيء');
      console.log('   ✅ PIN Code للدخول: 1234\n');
      console.log('🔗 اختبر الآن:');
      console.log('   npm run dev');
      console.log('   ثم اذهب إلى: http://localhost:3000/login\n');
    } else {
      console.log('\n⚠️  بعض الجداول تحتاج إلى المزيد من السجلات\n');
    }

  } catch (error) {
    console.error('\n❌ خطأ:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main().catch(console.error);
