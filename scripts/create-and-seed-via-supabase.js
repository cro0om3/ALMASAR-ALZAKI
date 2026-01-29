// 🚀 Create Tables and Seed Data via Supabase Client
// Run: node scripts/create-and-seed-via-supabase.js
// Note: Tables must be created first via SQL Editor

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Supabase credentials غير موجودة في .env.local');
  console.error('   SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? '✅' : '❌');
  process.exit(1);
}

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

async function seedUsers() {
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
      const { data, error } = await supabase
        .from('users')
        .upsert(user, { onConflict: 'email' })
        .select();
      
      if (error) throw error;
      console.log(`   ✅ ${user.email} (${user.role})`);
    } catch (error) {
      console.error(`   ❌ ${user.email}: ${error.message}`);
    }
  }
}

async function seedCustomers() {
  console.log('\n👥 إنشاء 5 عملاء...\n');
  
  const cities = ['Riyadh', 'Jeddah', 'Dammam', 'Khobar', 'Mecca'];
  const customers = [];
  
  for (let i = 1; i <= 5; i++) {
    customers.push({
      name: `Customer ${i}`,
      email: `customer${i}@example.com`,
      phone: `+9665${randomNumber(10000000, 99999999)}`,
      address: `${randomNumber(1, 999)} Main Street`,
      city: cities[i - 1],
      state: 'Saudi Arabia',
      zipCode: `${randomNumber(10000, 99999)}`,
      country: 'Saudi Arabia',
    });
  }

  for (const customer of customers) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .upsert(customer, { onConflict: 'email' })
        .select();
      
      if (error) throw error;
      console.log(`   ✅ ${customer.name} - ${customer.email}`);
    } catch (error) {
      console.error(`   ❌ ${customer.name}: ${error.message}`);
    }
  }
}

async function seedVendors() {
  console.log('\n🏢 إنشاء 5 موردين...\n');
  
  const cities = ['Riyadh', 'Jeddah', 'Dammam', 'Khobar', 'Mecca'];
  const vendors = [];
  
  for (let i = 1; i <= 5; i++) {
    vendors.push({
      name: `Vendor ${i}`,
      email: `vendor${i}@example.com`,
      phone: `+9665${randomNumber(10000000, 99999999)}`,
      address: `${randomNumber(1, 999)} Business Avenue`,
      city: cities[i - 1],
      state: 'Saudi Arabia',
      zipCode: `${randomNumber(10000, 99999)}`,
      country: 'Saudi Arabia',
      contactPerson: `Contact Person ${i}`,
    });
  }

  for (const vendor of vendors) {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .upsert(vendor, { onConflict: 'email' })
        .select();
      
      if (error) throw error;
      console.log(`   ✅ ${vendor.name} - ${vendor.email}`);
    } catch (error) {
      console.error(`   ❌ ${vendor.name}: ${error.message}`);
    }
  }
}

async function seedVehicles() {
  console.log('\n🚗 إنشاء 5 مركبات...\n');
  
  const makes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan'];
  const models = ['Camry', 'Accord', 'F-150', 'Silverado', 'Altima'];
  const colors = ['White', 'Black', 'Silver', 'Blue', 'Red'];
  
  const vehicles = [];
  for (let i = 1; i <= 5; i++) {
    vehicles.push({
      make: makes[i - 1],
      model: models[i - 1],
      year: randomNumber(2020, 2024),
      licensePlate: `ABC-${randomNumber(1000, 9999)}`,
      vin: `VIN${randomString(17).toUpperCase()}`,
      color: colors[i - 1],
      mileage: randomNumber(10000, 100000),
      purchaseDate: randomDate(new Date(2020, 0, 1), new Date()).toISOString(),
      purchasePrice: randomNumber(50000, 200000),
      status: 'active',
    });
  }

  for (const vehicle of vehicles) {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .upsert(vehicle, { onConflict: 'licensePlate' })
        .select();
      
      if (error) throw error;
      console.log(`   ✅ ${vehicle.make} ${vehicle.model} - ${vehicle.licensePlate}`);
    } catch (error) {
      console.error(`   ❌ ${vehicle.licensePlate}: ${error.message}`);
    }
  }
}

async function seedEmployees() {
  console.log('\n👔 إنشاء 5 موظفين...\n');
  
  const positions = ['Manager', 'Engineer', 'Accountant', 'Sales', 'HR'];
  const departments = ['Management', 'Engineering', 'Finance', 'Sales', 'HR'];
  const firstNames = ['Ahmed', 'Mohammed', 'Ali', 'Omar', 'Khalid'];
  const lastNames = ['Al-Saud', 'Al-Rashid', 'Al-Mansour', 'Al-Fahad', 'Al-Zahrani'];
  
  const employees = [];
  for (let i = 1; i <= 5; i++) {
    employees.push({
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
    });
  }

  for (const employee of employees) {
    try {
      const { data, error } = await supabase
        .from('employees')
        .upsert(employee, { onConflict: 'email' })
        .select();
      
      if (error) throw error;
      console.log(`   ✅ ${employee.firstName} ${employee.lastName} - ${employee.employeeNumber}`);
    } catch (error) {
      console.error(`   ❌ ${employee.employeeNumber}: ${error.message}`);
    }
  }
}

async function seedQuotations() {
  console.log('\n📄 إنشاء 5 عروض أسعار...\n');
  
  const { data: customers } = await supabase.from('customers').select('id, name').limit(5);
  if (!customers || customers.length === 0) {
    console.log('   ⚠️  لا يوجد عملاء - تم تخطي العروض');
    return;
  }

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

      // Create items
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

async function seedInvoices() {
  console.log('\n🧾 إنشاء 5 فواتير...\n');
  
  const { data: customers } = await supabase.from('customers').select('id, name').limit(5);
  if (!customers || customers.length === 0) {
    console.log('   ⚠️  لا يوجد عملاء - تم تخطي الفواتير');
    return;
  }

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

      // Create items
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

async function seedPurchaseOrders() {
  console.log('\n🛒 إنشاء 5 أوامر شراء...\n');
  
  const { data: vendors } = await supabase.from('vendors').select('id, name').limit(5);
  const { data: customers } = await supabase.from('customers').select('id, name').limit(5);
  
  if (!vendors || vendors.length === 0) {
    console.log('   ⚠️  لا يوجد موردين - تم تخطي أوامر الشراء');
    return;
  }

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

      // Create items
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

async function seedReceipts() {
  console.log('\n💰 إنشاء 5 إيصالات...\n');
  
  const { data: invoices } = await supabase.from('invoices').select('id, customerId, total').limit(5);
  if (!invoices || invoices.length === 0) {
    console.log('   ⚠️  لا يوجد فواتير - تم تخطي الإيصالات');
    return;
  }

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

async function seedPayslips() {
  console.log('\n💵 إنشاء 5 كشوف مرتبات...\n');
  
  const { data: employees } = await supabase.from('employees').select('id, firstName, lastName, salary').limit(5);
  if (!employees || employees.length === 0) {
    console.log('   ⚠️  لا يوجد موظفين - تم تخطي كشوف المرتبات');
    return;
  }

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
  try {
    console.log('🚀 ========================================');
    console.log('🚀 إنشاء البيانات عبر Supabase Client');
    console.log('🚀 ========================================\n');

    console.log('⚠️  ملاحظة: يجب إنشاء الجداول أولاً عبر Supabase SQL Editor');
    console.log('   استخدم ملف: supabase-schema.sql\n');

    // Test connection
    console.log('🔌 اختبار الاتصال...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('⚠️  الجداول غير موجودة - يجب إنشاؤها أولاً\n');
      console.log('📝 الخطوات:');
      console.log('   1. اذهب إلى: https://supabase.com/dashboard/project/ebelbztbpzccdhytynnc/sql/new');
      console.log('   2. انسخ محتوى: supabase-schema.sql');
      console.log('   3. الصق في SQL Editor واضغط Run');
      console.log('   4. شغّل هذا السكريبت مرة أخرى\n');
      return;
    }
    console.log('✅ الاتصال ناجح!\n');

    // Seed data
    await seedUsers();
    await seedCustomers();
    await seedVendors();
    await seedVehicles();
    await seedEmployees();
    await seedQuotations();
    await seedInvoices();
    await seedPurchaseOrders();
    await seedReceipts();
    await seedPayslips();

    // Verify
    await verifyAllTables();

    console.log('\n🎉 ========================================');
    console.log('🎉 تم إنجاز كل شيء بنجاح!');
    console.log('🎉 ========================================\n');
    console.log('📝 ملخص:');
    console.log('   ✅ تم إضافة 5 سجلات لكل جدول');
    console.log('   ✅ PIN Code للدخول: 1234\n');

  } catch (error) {
    console.error('\n❌ خطأ:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
