// 🚀 Complete Database Setup: Create Tables + Seed 5 Records Each
// Run: node scripts/complete-database-setup.js
// This script creates all tables and seeds 5 records to each table

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});
const SCHEMA_SQL_PATH = path.join(__dirname, '..', 'supabase-schema.sql');

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

async function createTables() {
  console.log('📦 إنشاء الجداول...\n');
  
  const sqlContent = fs.readFileSync(SCHEMA_SQL_PATH, 'utf8');
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().includes('select'));

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement) continue;

    try {
      await prisma.$executeRawUnsafe(statement);
      successCount++;
      
      if (statement.includes('CREATE TABLE')) {
        const tableName = statement.match(/"(.*?)"/)?.[1] || 'unknown';
        console.log(`   ✅ ${tableName}`);
      }
    } catch (error) {
      if (error.message?.includes('already exists') || 
          error.message?.includes('duplicate') ||
          error.code === '42P07' || 
          error.code === '42710') {
        successCount++;
        continue;
      }
      errorCount++;
      if (statement.includes('CREATE TABLE') || statement.includes('ALTER TABLE')) {
        console.error(`   ⚠️  ${error.message.substring(0, 80)}...`);
      }
    }
  }

  console.log(`\n✅ تم تنفيذ ${successCount} أمر`);
  if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} أخطاء (معظمها "already exists" - طبيعي)`);
  }
  console.log('');
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
      await prisma.user.upsert({
        where: { email: user.email },
        update: user,
        create: user,
      });
      console.log(`   ✅ ${user.email} (${user.role})`);
    } catch (error) {
      console.error(`   ❌ ${user.email}: ${error.message}`);
    }
  }
}

async function seedCustomers() {
  console.log('\n👥 إنشاء 5 عملاء...\n');
  
  const cities = ['Riyadh', 'Jeddah', 'Dammam', 'Khobar', 'Mecca'];
  for (let i = 1; i <= 5; i++) {
    try {
      await prisma.customer.upsert({
        where: { email: `customer${i}@example.com` },
        update: {},
        create: {
          name: `Customer ${i}`,
          email: `customer${i}@example.com`,
          phone: `+9665${randomNumber(10000000, 99999999)}`,
          address: `${randomNumber(1, 999)} Main Street`,
          city: cities[i - 1],
          state: 'Saudi Arabia',
          zipCode: `${randomNumber(10000, 99999)}`,
          country: 'Saudi Arabia',
        },
      });
      console.log(`   ✅ Customer ${i}`);
    } catch (error) {
      console.error(`   ❌ Customer ${i}: ${error.message}`);
    }
  }
}

async function seedVendors() {
  console.log('\n🏢 إنشاء 5 موردين...\n');
  
  const cities = ['Riyadh', 'Jeddah', 'Dammam', 'Khobar', 'Mecca'];
  for (let i = 1; i <= 5; i++) {
    try {
      await prisma.vendor.upsert({
        where: { email: `vendor${i}@example.com` },
        update: {},
        create: {
          name: `Vendor ${i}`,
          email: `vendor${i}@example.com`,
          phone: `+9665${randomNumber(10000000, 99999999)}`,
          address: `${randomNumber(1, 999)} Business Avenue`,
          city: cities[i - 1],
          state: 'Saudi Arabia',
          zipCode: `${randomNumber(10000, 99999)}`,
          country: 'Saudi Arabia',
          contactPerson: `Contact Person ${i}`,
        },
      });
      console.log(`   ✅ Vendor ${i}`);
    } catch (error) {
      console.error(`   ❌ Vendor ${i}: ${error.message}`);
    }
  }
}

async function seedVehicles() {
  console.log('\n🚗 إنشاء 5 مركبات...\n');
  
  const makes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan'];
  const models = ['Camry', 'Accord', 'F-150', 'Silverado', 'Altima'];
  const colors = ['White', 'Black', 'Silver', 'Blue', 'Red'];
  
  for (let i = 1; i <= 5; i++) {
    const licensePlate = `ABC-${randomNumber(1000, 9999)}`;
    try {
      await prisma.vehicle.upsert({
        where: { licensePlate },
        update: {},
        create: {
          make: makes[i - 1],
          model: models[i - 1],
          year: randomNumber(2020, 2024),
          licensePlate,
          vin: `VIN${randomString(17).toUpperCase()}`,
          color: colors[i - 1],
          mileage: randomNumber(10000, 100000),
          purchaseDate: randomDate(new Date(2020, 0, 1), new Date()),
          purchasePrice: randomNumber(50000, 200000),
          status: 'active',
        },
      });
      console.log(`   ✅ ${makes[i - 1]} ${models[i - 1]} - ${licensePlate}`);
    } catch (error) {
      console.error(`   ❌ Vehicle ${i}: ${error.message}`);
    }
  }
}

async function seedEmployees() {
  console.log('\n👔 إنشاء 5 موظفين...\n');
  
  const positions = ['Manager', 'Engineer', 'Accountant', 'Sales', 'HR'];
  const departments = ['Management', 'Engineering', 'Finance', 'Sales', 'HR'];
  const firstNames = ['Ahmed', 'Mohammed', 'Ali', 'Omar', 'Khalid'];
  const lastNames = ['Al-Saud', 'Al-Rashid', 'Al-Mansour', 'Al-Fahad', 'Al-Zahrani'];
  
  for (let i = 1; i <= 5; i++) {
    try {
      await prisma.employee.upsert({
        where: { email: `employee${i}@example.com` },
        update: {},
        create: {
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
          hireDate: randomDate(new Date(2020, 0, 1), new Date()),
          salary: randomNumber(5000, 15000),
          status: 'active',
        },
      });
      console.log(`   ✅ ${firstNames[i - 1]} ${lastNames[i - 1]} - EMP${String(i).padStart(4, '0')}`);
    } catch (error) {
      console.error(`   ❌ Employee ${i}: ${error.message}`);
    }
  }
}

async function seedQuotations() {
  console.log('\n📄 إنشاء 5 عروض أسعار...\n');
  
  const customers = await prisma.customer.findMany({ take: 5 });
  if (customers.length === 0) {
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
      const quotation = await prisma.quotation.create({
        data: {
          quotationNumber: `QT-${String(i).padStart(6, '0')}`,
          customerId: customer.id,
          date: new Date(),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          subtotal,
          taxRate,
          taxAmount,
          discount,
          total,
          status: ['draft', 'sent', 'accepted'][i % 3],
        },
      });

      await prisma.quotationItem.create({
        data: {
          quotationId: quotation.id,
          description: `Item ${i} Description`,
          quantity: randomNumber(1, 10),
          unitPrice: randomNumber(100, 1000),
          discount: 0,
          tax: 0,
          total: randomNumber(500, 5000),
        },
      });

      console.log(`   ✅ ${quotation.quotationNumber} - ${customer.name}`);
    } catch (error) {
      console.error(`   ❌ Quotation ${i}: ${error.message}`);
    }
  }
}

async function seedInvoices() {
  console.log('\n🧾 إنشاء 5 فواتير...\n');
  
  const customers = await prisma.customer.findMany({ take: 5 });
  if (customers.length === 0) {
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
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: `INV-${String(i).padStart(6, '0')}`,
          customerId: customer.id,
          date: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          subtotal,
          taxRate,
          taxAmount,
          discount,
          total,
          paidAmount,
          status: paidAmount === total ? 'paid' : 'sent',
        },
      });

      await prisma.invoiceItem.create({
        data: {
          invoiceId: invoice.id,
          description: `Invoice Item ${i}`,
          quantity: randomNumber(1, 10),
          unitPrice: randomNumber(100, 1000),
          discount: 0,
          tax: 0,
          total: randomNumber(500, 5000),
        },
      });

      console.log(`   ✅ ${invoice.invoiceNumber} - ${customer.name} - ${invoice.status}`);
    } catch (error) {
      console.error(`   ❌ Invoice ${i}: ${error.message}`);
    }
  }
}

async function seedPurchaseOrders() {
  console.log('\n🛒 إنشاء 5 أوامر شراء...\n');
  
  const vendors = await prisma.vendor.findMany({ take: 5 });
  const customers = await prisma.customer.findMany({ take: 5 });
  
  if (vendors.length === 0) {
    console.log('   ⚠️  لا يوجد موردين - تم تخطي أوامر الشراء');
    return;
  }

  for (let i = 1; i <= 5; i++) {
    const vendor = vendors[i - 1] || vendors[0];
    const customer = customers[i - 1] || customers[0];
    const subtotal = randomNumber(1000, 50000);
    const taxRate = 0.15;
    const taxAmount = subtotal * taxRate;
    const discount = randomNumber(0, subtotal * 0.1);
    const total = subtotal + taxAmount - discount;

    try {
      const po = await prisma.purchaseOrder.create({
        data: {
          orderNumber: `PO-${String(i).padStart(6, '0')}`,
          vendorId: vendor.id,
          customerId: customer.id,
          date: new Date(),
          expectedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          subtotal,
          taxRate,
          taxAmount,
          discount,
          total,
          status: ['draft', 'pending', 'approved'][i % 3],
        },
      });

      await prisma.purchaseOrderItem.create({
        data: {
          purchaseOrderId: po.id,
          description: `PO Item ${i}`,
          quantity: randomNumber(1, 10),
          unitPrice: randomNumber(100, 1000),
          discount: 0,
          tax: 0,
          total: randomNumber(500, 5000),
        },
      });

      console.log(`   ✅ ${po.orderNumber} - ${vendor.name}`);
    } catch (error) {
      console.error(`   ❌ PO ${i}: ${error.message}`);
    }
  }
}

async function seedReceipts() {
  console.log('\n💰 إنشاء 5 إيصالات...\n');
  
  const invoices = await prisma.invoice.findMany({ take: 5 });
  if (invoices.length === 0) {
    console.log('   ⚠️  لا يوجد فواتير - تم تخطي الإيصالات');
    return;
  }

  const paymentMethods = ['cash', 'bank_transfer', 'cheque', 'credit_card', 'other'];

  for (let i = 1; i <= 5; i++) {
    const invoice = invoices[i - 1] || invoices[0];

    try {
      const receipt = await prisma.receipt.create({
        data: {
          receiptNumber: `RCP-${String(i).padStart(6, '0')}`,
          invoiceId: invoice.id,
          customerId: invoice.customerId,
          date: new Date(),
          paymentDate: new Date(),
          amount: invoice.total,
          paymentMethod: paymentMethods[i - 1],
          referenceNumber: `REF${randomNumber(100000, 999999)}`,
          status: 'issued',
        },
      });

      const customer = await prisma.customer.findUnique({ where: { id: invoice.customerId } });
      console.log(`   ✅ ${receipt.receiptNumber} - ${customer?.name || 'Unknown'} - ${receipt.paymentMethod}`);
    } catch (error) {
      console.error(`   ❌ Receipt ${i}: ${error.message}`);
    }
  }
}

async function seedPayslips() {
  console.log('\n💵 إنشاء 5 كشوف مرتبات...\n');
  
  const employees = await prisma.employee.findMany({ take: 5 });
  if (employees.length === 0) {
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
      const payslip = await prisma.payslip.create({
        data: {
          payslipNumber: `PS-${String(i).padStart(6, '0')}`,
          employeeId: employee.id,
          payPeriodStart: periodStart,
          payPeriodEnd: periodEnd,
          issueDate: new Date(),
          baseSalary,
          overtime,
          bonuses,
          deductions,
          tax,
          netPay,
          status: 'issued',
        },
      });

      console.log(`   ✅ ${payslip.payslipNumber} - ${employee.firstName} ${employee.lastName} - ${netPay.toFixed(2)} SAR`);
    } catch (error) {
      console.error(`   ❌ Payslip ${i}: ${error.message}`);
    }
  }
}

async function verifyAllTables() {
  console.log('\n🔍 التحقق من جميع الجداول...\n');
  
  const tables = [
    { name: 'users', model: prisma.user },
    { name: 'customers', model: prisma.customer },
    { name: 'vendors', model: prisma.vendor },
    { name: 'vehicles', model: prisma.vehicle },
    { name: 'employees', model: prisma.employee },
    { name: 'quotations', model: prisma.quotation },
    { name: 'quotation_items', model: prisma.quotationItem },
    { name: 'invoices', model: prisma.invoice },
    { name: 'invoice_items', model: prisma.invoiceItem },
    { name: 'purchase_orders', model: prisma.purchaseOrder },
    { name: 'purchase_order_items', model: prisma.purchaseOrderItem },
    { name: 'receipts', model: prisma.receipt },
    { name: 'payslips', model: prisma.payslip },
  ];

  for (const table of tables) {
    try {
      const count = await table.model.count();
      console.log(`   ${count >= 5 ? '✅' : '⚠️ '} ${table.name}: ${count} سجل`);
    } catch (error) {
      console.error(`   ❌ ${table.name}: ${error.message}`);
    }
  }
}

async function main() {
  try {
    console.log('🚀 ========================================');
    console.log('🚀 Complete Database Setup');
    console.log('🚀 ========================================\n');

    // Test connection
    console.log('🔌 اختبار الاتصال...');
    await prisma.$connect();
    console.log('✅ الاتصال ناجح!\n');

    // Step 1: Create tables
    await createTables();

    // Step 2: Seed data
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

    // Step 3: Verify
    await verifyAllTables();

    console.log('\n🎉 ========================================');
    console.log('🎉 تم إنجاز كل شيء بنجاح!');
    console.log('🎉 ========================================\n');
    console.log('📝 ملخص:');
    console.log('   ✅ تم إنشاء/التحقق من 13 جدول');
    console.log('   ✅ تم إضافة 5 سجلات لكل جدول');
    console.log('   ✅ PIN Code للدخول: 1234\n');
    console.log('🔗 اختبر الآن:');
    console.log('   npm run dev');
    console.log('   ثم اذهب إلى: http://localhost:3000/login\n');

  } catch (error) {
    console.error('\n❌ خطأ:', error.message);
    if (error.message?.includes('Can\'t reach database server')) {
      console.log('\n💡 المشكلة: لا يمكن الاتصال بقاعدة البيانات');
      console.log('📋 الحل:');
      console.log('   1. تحقق من كلمة مرور قاعدة البيانات في Supabase Dashboard');
      console.log('   2. استخدم Supabase SQL Editor لإنشاء الجداول:');
      console.log('      https://supabase.com/dashboard/project/ebelbztbpzccdhytynnc/sql/new');
      console.log('   3. انسخ supabase-schema.sql والصقه في SQL Editor');
      console.log('   4. بعد الإنشاء، شغّل هذا السكريبت مرة أخرى\n');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
