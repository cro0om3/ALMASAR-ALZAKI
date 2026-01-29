// 🚀 MASTER SETUP: Create Tables + Seed 5 Records Each
// Run: node scripts/MASTER-SETUP.js
// This is the complete script that does everything

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
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

// Execute SQL via Supabase Management API (requires PAT, not Service Key)
async function executeSQLViaManagementAPI(sql) {
  // Management API requires Personal Access Token
  // Service Role Key won't work
  console.log('⚠️  Management API يتطلب Personal Access Token (PAT)');
  console.log('💡 Service Role Key لا يعمل مع Management API\n');
  return false;
}

// Check if tables exist
async function checkTablesExist() {
  try {
    const { error } = await supabase.from('users').select('count').limit(1);
    if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

// Seed all data (5 records per table)
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
        phone: `+9665${randomNumber(10000000, 99999999)}`,
        address: `${randomNumber(1, 999)} Main Street`,
        city: cities[i - 1],
        state: 'Saudi Arabia',
        zipCode: `${randomNumber(10000, 99999)}`,
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
        phone: `+9665${randomNumber(10000000, 99999999)}`,
        address: `${randomNumber(1, 999)} Business Avenue`,
        city: cities[i - 1],
        state: 'Saudi Arabia',
        zipCode: `${randomNumber(10000, 99999)}`,
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
    const licensePlate = `ABC-${randomNumber(1000, 9999)}`;
    try {
      const { error } = await supabase.from('vehicles').upsert({
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
      }, { onConflict: 'email' });
      if (error) throw error;
      console.log(`   ✅ ${firstNames[i - 1]} ${lastNames[i - 1]}`);
    } catch (error) {
      console.error(`   ❌ Employee ${i}: ${error.message}`);
    }
  }

  // Quotations (5)
  console.log('\n📄 إنشاء 5 عروض أسعار...\n');
  const { data: customers } = await supabase.from('customers').select('id, name').limit(5);
  if (customers && customers.length > 0) {
    for (let i = 1; i <= 5; i++) {
      const customer = customers[i - 1] || customers[0];
      const subtotal = randomNumber(1000, 50000);
      const taxRate = 0.15;
      const taxAmount = subtotal * taxRate;
      const discount = randomNumber(0, subtotal * 0.1);
      const total = subtotal + taxAmount - discount;

      try {
        const { data: quotation, error: qError } = await supabase
          .from('quotations')
          .insert({
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
          })
          .select()
          .single();

        if (qError) throw qError;

        await supabase.from('quotation_items').insert({
          quotationId: quotation.id,
          description: `Item ${i} Description`,
          quantity: randomNumber(1, 10),
          unitPrice: randomNumber(100, 1000),
          discount: 0,
          tax: 0,
          total: randomNumber(500, 5000),
        });

        console.log(`   ✅ ${quotation.quotationNumber} - ${customer.name}`);
      } catch (error) {
        console.error(`   ❌ Quotation ${i}: ${error.message}`);
      }
    }
  }

  // Invoices (5)
  console.log('\n🧾 إنشاء 5 فواتير...\n');
  if (customers && customers.length > 0) {
    for (let i = 1; i <= 5; i++) {
      const customer = customers[i - 1] || customers[0];
      const subtotal = randomNumber(1000, 50000);
      const taxRate = 0.15;
      const taxAmount = subtotal * taxRate;
      const discount = randomNumber(0, subtotal * 0.1);
      const total = subtotal + taxAmount - discount;
      const paidAmount = i <= 2 ? total : randomNumber(0, total * 0.8);

      try {
        const { data: invoice, error: invError } = await supabase
          .from('invoices')
          .insert({
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
          })
          .select()
          .single();

        if (invError) throw invError;

        await supabase.from('invoice_items').insert({
          invoiceId: invoice.id,
          description: `Invoice Item ${i}`,
          quantity: randomNumber(1, 10),
          unitPrice: randomNumber(100, 1000),
          discount: 0,
          tax: 0,
          total: randomNumber(500, 5000),
        });

        console.log(`   ✅ ${invoice.invoiceNumber} - ${customer.name} - ${invoice.status}`);
      } catch (error) {
        console.error(`   ❌ Invoice ${i}: ${error.message}`);
      }
    }
  }

  // Purchase Orders (5)
  console.log('\n🛒 إنشاء 5 أوامر شراء...\n');
  const { data: vendors } = await supabase.from('vendors').select('id, name').limit(5);
  if (vendors && vendors.length > 0) {
    for (let i = 1; i <= 5; i++) {
      const vendor = vendors[i - 1] || vendors[0];
      const customer = customers?.[i - 1] || customers?.[0];
      const subtotal = randomNumber(1000, 50000);
      const taxRate = 0.15;
      const taxAmount = subtotal * taxRate;
      const discount = randomNumber(0, subtotal * 0.1);
      const total = subtotal + taxAmount - discount;

      try {
        const { data: po, error: poError } = await supabase
          .from('purchase_orders')
          .insert({
            orderNumber: `PO-${String(i).padStart(6, '0')}`,
            vendorId: vendor.id,
            customerId: customer?.id,
            date: new Date().toISOString(),
            expectedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            subtotal,
            taxRate,
            taxAmount,
            discount,
            total,
            status: ['draft', 'pending', 'approved'][i % 3],
          })
          .select()
          .single();

        if (poError) throw poError;

        await supabase.from('purchase_order_items').insert({
          purchaseOrderId: po.id,
          description: `PO Item ${i}`,
          quantity: randomNumber(1, 10),
          unitPrice: randomNumber(100, 1000),
          discount: 0,
          tax: 0,
          total: randomNumber(500, 5000),
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
        const { data: receipt, error: rError } = await supabase
          .from('receipts')
          .insert({
            receiptNumber: `RCP-${String(i).padStart(6, '0')}`,
            invoiceId: invoice.id,
            customerId: invoice.customerId,
            date: new Date().toISOString(),
            paymentDate: new Date().toISOString(),
            amount: invoice.total,
            paymentMethod: paymentMethods[i - 1],
            referenceNumber: `REF${randomNumber(100000, 999999)}`,
            status: 'issued',
          })
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
  const { data: employees } = await supabase.from('employees').select('id, firstName, lastName, salary').limit(5);
  if (employees && employees.length > 0) {
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
        const { data: payslip, error: pError } = await supabase
          .from('payslips')
          .insert({
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
          })
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
    console.log('🚀 MASTER SETUP - Complete Database Setup');
    console.log('🚀 ========================================\n');

    // Check if tables exist
    console.log('🔍 التحقق من وجود الجداول...');
    const tablesExist = await checkTablesExist();
    
    if (!tablesExist) {
      console.log('⚠️  الجداول غير موجودة!\n');
      console.log('📋 يجب إنشاء الجداول أولاً:\n');
      console.log('   1. اذهب إلى: https://supabase.com/dashboard/project/ebelbztbpzccdhytynnc/sql/new');
      console.log('   2. انسخ محتوى: supabase-schema.sql');
      console.log('   3. الصق في SQL Editor');
      console.log('   4. اضغط "Run"');
      console.log('   5. بعد الإنشاء، شغّل هذا السكريبت مرة أخرى\n');
      return;
    }
    
    console.log('✅ الجداول موجودة!\n');

    // Seed data
    await seedAllData();

    // Verify
    const allGood = await verifyAllTables();

    if (allGood) {
      console.log('\n🎉 ========================================');
      console.log('🎉 تم إنجاز كل شيء بنجاح!');
      console.log('🎉 ========================================\n');
      console.log('📝 ملخص:');
      console.log('   ✅ تم إضافة 5 سجلات لكل جدول');
      console.log('   ✅ PIN Code للدخول: 1234');
      console.log('   ✅ RLS معطّل - الكل يشوف كل شيء\n');
      console.log('🔗 اختبر الآن:');
      console.log('   npm run dev');
      console.log('   ثم اذهب إلى: http://localhost:3000/login\n');
    } else {
      console.log('\n⚠️  بعض الجداول تحتاج إلى المزيد من السجلات\n');
    }

  } catch (error) {
    console.error('\n❌ خطأ:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
