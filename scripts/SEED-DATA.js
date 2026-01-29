// Seed database with 5 dummy records for each table
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ebelbztbpzccdhytynnc.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_t0LnDUHEpTMSNez6PyLIqg_udKq1Zmq'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Generate random ID
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Seed Users
async function seedUsers() {
  console.log('\n👥 إضافة 5 مستخدمين...\n')
  
  const users = [
    {
      id: 'user_admin_001',
      email: 'admin@almsaralzaki.com',
      name: 'Administrator',
      password: '$2a$10$dummyhash', // In real app, hash this
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'user_manager_001',
      email: 'manager@almsaralzaki.com',
      name: 'Manager User',
      password: '$2a$10$dummyhash',
      role: 'manager',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'user_accountant_001',
      email: 'accountant@almsaralzaki.com',
      name: 'Accountant User',
      password: '$2a$10$dummyhash',
      role: 'accountant',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'user_clerk_001',
      email: 'clerk@almsaralzaki.com',
      name: 'Clerk User',
      password: '$2a$10$dummyhash',
      role: 'clerk',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'user_viewer_001',
      email: 'viewer@almsaralzaki.com',
      name: 'Viewer User',
      password: '$2a$10$dummyhash',
      role: 'viewer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  let success = 0
  for (const user of users) {
    try {
      const { data, error } = await supabase.from('users').upsert(user, { onConflict: 'id' })
      if (error && !error.message.includes('duplicate')) {
        console.log(`⚠️  ${user.name}: ${error.message.substring(0, 60)}`)
      } else {
        console.log(`✅ ${user.name} (${user.email})`)
        success++
      }
    } catch (err) {
      console.log(`❌ ${user.name}: ${err.message.substring(0, 60)}`)
    }
  }
  return success
}

// Seed Customers
async function seedCustomers() {
  console.log('\n👤 إضافة 5 عملاء...\n')
  
  const customers = [
    {
      id: generateId('cust'),
      name: 'Ahmed Al-Saud',
      email: 'ahmed.alsaud@example.com',
      phone: '+966501234567',
      address: 'King Fahd Road, Building 123',
      city: 'Riyadh',
      state: 'Riyadh',
      zipCode: '12345',
      country: 'Saudi Arabia',
      idNumber: '1234567890',
      nationality: 'Saudi',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId('cust'),
      name: 'Mohammed Hassan',
      email: 'mohammed.hassan@example.com',
      phone: '+966502345678',
      address: 'Prince Sultan Street, Apartment 456',
      city: 'Jeddah',
      state: 'Makkah',
      zipCode: '23456',
      country: 'Saudi Arabia',
      passportNumber: 'A12345678',
      nationality: 'Egyptian',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId('cust'),
      name: 'Fatima Ali',
      email: 'fatima.ali@example.com',
      phone: '+966503456789',
      address: 'Al Olaya District, Villa 789',
      city: 'Riyadh',
      state: 'Riyadh',
      zipCode: '34567',
      country: 'Saudi Arabia',
      idNumber: '9876543210',
      nationality: 'Saudi',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId('cust'),
      name: 'Khalid Ibrahim',
      email: 'khalid.ibrahim@example.com',
      phone: '+966504567890',
      address: 'Corniche Road, Office 101',
      city: 'Dammam',
      state: 'Eastern Province',
      zipCode: '45678',
      country: 'Saudi Arabia',
      idNumber: '1122334455',
      nationality: 'Saudi',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId('cust'),
      name: 'Sarah Abdullah',
      email: 'sarah.abdullah@example.com',
      phone: '+966505678901',
      address: 'Al Malqa District, Building 202',
      city: 'Riyadh',
      state: 'Riyadh',
      zipCode: '56789',
      country: 'Saudi Arabia',
      idNumber: '5566778899',
      nationality: 'Saudi',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  let success = 0
  for (const customer of customers) {
    try {
      const { data, error } = await supabase.from('customers').upsert(customer, { onConflict: 'id' })
      if (error && !error.message.includes('duplicate')) {
        console.log(`⚠️  ${customer.name}: ${error.message.substring(0, 60)}`)
      } else {
        console.log(`✅ ${customer.name} (${customer.email})`)
        success++
      }
    } catch (err) {
      console.log(`❌ ${customer.name}: ${err.message.substring(0, 60)}`)
    }
  }
  return success
}

// Seed Vendors
async function seedVendors() {
  console.log('\n🏢 إضافة 5 موردين...\n')
  
  const vendors = [
    {
      id: generateId('vend'),
      name: 'Al-Rashid Trading Company',
      email: 'info@alrashid.com',
      phone: '+966112345678',
      address: 'Industrial Area, Warehouse 1',
      city: 'Riyadh',
      state: 'Riyadh',
      zipCode: '12345',
      country: 'Saudi Arabia',
      contactPerson: 'Omar Al-Rashid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId('vend'),
      name: 'Gulf Equipment Suppliers',
      email: 'sales@gulfequipment.com',
      phone: '+966122345678',
      address: 'King Abdulaziz Road, Showroom 5',
      city: 'Jeddah',
      state: 'Makkah',
      zipCode: '23456',
      country: 'Saudi Arabia',
      contactPerson: 'Hassan Al-Ghamdi',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId('vend'),
      name: 'Eastern Parts Distributors',
      email: 'contact@easternparts.com',
      phone: '+966133456789',
      address: 'Dammam Industrial City, Block 3',
      city: 'Dammam',
      state: 'Eastern Province',
      zipCode: '34567',
      country: 'Saudi Arabia',
      contactPerson: 'Fahad Al-Dosari',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId('vend'),
      name: 'National Maintenance Services',
      email: 'info@nationalmaintenance.com',
      phone: '+966144567890',
      address: 'Al Khobar Corniche, Office 12',
      city: 'Al Khobar',
      state: 'Eastern Province',
      zipCode: '45678',
      country: 'Saudi Arabia',
      contactPerson: 'Nasser Al-Mutairi',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId('vend'),
      name: 'Central Auto Parts',
      email: 'sales@centralautoparts.com',
      phone: '+966155678901',
      address: 'Prince Faisal Street, Shop 8',
      city: 'Riyadh',
      state: 'Riyadh',
      zipCode: '56789',
      country: 'Saudi Arabia',
      contactPerson: 'Yousef Al-Shehri',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  let success = 0
  for (const vendor of vendors) {
    try {
      const { data, error } = await supabase.from('vendors').upsert(vendor, { onConflict: 'id' })
      if (error && !error.message.includes('duplicate')) {
        console.log(`⚠️  ${vendor.name}: ${error.message.substring(0, 60)}`)
      } else {
        console.log(`✅ ${vendor.name} (${vendor.contactPerson})`)
        success++
      }
    } catch (err) {
      console.log(`❌ ${vendor.name}: ${err.message.substring(0, 60)}`)
    }
  }
  return success
}

// Seed Vehicles
async function seedVehicles() {
  console.log('\n🚗 إضافة 5 مركبات...\n')
  
  const vehicles = [
    {
      id: generateId('veh'),
      make: 'Mercedes-Benz',
      model: 'Actros 1845',
      year: 2022,
      licensePlate: 'ABC-1234',
      vin: 'WDB9634561A123456',
      color: 'White',
      mileage: 45000,
      purchaseDate: new Date('2022-01-15').toISOString(),
      purchasePrice: 350000,
      status: 'active',
      notes: 'Heavy duty truck for transport',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId('veh'),
      make: 'Volvo',
      model: 'FH16 540',
      year: 2021,
      licensePlate: 'XYZ-5678',
      vin: 'YV1CM3821A1234567',
      color: 'Blue',
      mileage: 78000,
      purchaseDate: new Date('2021-06-20').toISOString(),
      purchasePrice: 420000,
      status: 'active',
      notes: 'Long haul transport vehicle',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId('veh'),
      make: 'Scania',
      model: 'R 450',
      year: 2023,
      licensePlate: 'DEF-9012',
      vin: 'YS4E4X12345678901',
      color: 'Red',
      mileage: 12000,
      purchaseDate: new Date('2023-03-10').toISOString(),
      purchasePrice: 380000,
      status: 'active',
      notes: 'New addition to fleet',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId('veh'),
      make: 'MAN',
      model: 'TGX 18.440',
      year: 2020,
      licensePlate: 'GHI-3456',
      vin: 'WMA12345678901234',
      color: 'Silver',
      mileage: 95000,
      purchaseDate: new Date('2020-09-05').toISOString(),
      purchasePrice: 320000,
      status: 'active',
      notes: 'Reliable workhorse',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId('veh'),
      make: 'Iveco',
      model: 'Stralis Hi-Way',
      year: 2022,
      licensePlate: 'JKL-7890',
      vin: 'ZCF12345678901234',
      color: 'Black',
      mileage: 55000,
      purchaseDate: new Date('2022-05-18').toISOString(),
      purchasePrice: 340000,
      status: 'active',
      notes: 'Fuel efficient model',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  let success = 0
  for (const vehicle of vehicles) {
    try {
      const { data, error } = await supabase.from('vehicles').upsert(vehicle, { onConflict: 'id' })
      if (error && !error.message.includes('duplicate')) {
        console.log(`⚠️  ${vehicle.make} ${vehicle.model}: ${error.message.substring(0, 60)}`)
      } else {
        console.log(`✅ ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`)
        success++
      }
    } catch (err) {
      console.log(`❌ ${vehicle.make} ${vehicle.model}: ${err.message.substring(0, 60)}`)
    }
  }
  return success
}

// Seed Employees
async function seedEmployees() {
  console.log('\n👷 إضافة 5 موظفين...\n')
  
  const employees = [
    {
      id: generateId('emp'),
      employeeNumber: 'EMP001',
      firstName: 'Abdullah',
      lastName: 'Al-Mutairi',
      email: 'abdullah.almutairi@almsaralzaki.com',
      phone: '+966501111111',
      address: 'Al Malqa, Villa 1',
      city: 'Riyadh',
      state: 'Riyadh',
      zipCode: '12345',
      country: 'Saudi Arabia',
      position: 'Operations Manager',
      department: 'Operations',
      hireDate: new Date('2020-01-15').toISOString(),
      salary: 15000,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId('emp'),
      employeeNumber: 'EMP002',
      firstName: 'Khalid',
      lastName: 'Al-Shehri',
      email: 'khalid.alshehri@almsaralzaki.com',
      phone: '+966502222222',
      address: 'Al Olaya, Apartment 2',
      city: 'Riyadh',
      state: 'Riyadh',
      zipCode: '12345',
      country: 'Saudi Arabia',
      position: 'Accountant',
      department: 'Finance',
      hireDate: new Date('2021-03-20').toISOString(),
      salary: 12000,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId('emp'),
      employeeNumber: 'EMP003',
      firstName: 'Mohammed',
      lastName: 'Al-Dosari',
      email: 'mohammed.aldosari@almsaralzaki.com',
      phone: '+966503333333',
      address: 'Al Naseem, Building 3',
      city: 'Riyadh',
      state: 'Riyadh',
      zipCode: '12345',
      country: 'Saudi Arabia',
      position: 'Driver',
      department: 'Transport',
      hireDate: new Date('2019-06-10').toISOString(),
      salary: 8000,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId('emp'),
      employeeNumber: 'EMP004',
      firstName: 'Fahad',
      lastName: 'Al-Ghamdi',
      email: 'fahad.alghamdi@almsaralzaki.com',
      phone: '+966504444444',
      address: 'Al Wurud, House 4',
      city: 'Riyadh',
      state: 'Riyadh',
      zipCode: '12345',
      country: 'Saudi Arabia',
      position: 'Mechanic',
      department: 'Maintenance',
      hireDate: new Date('2020-08-25').toISOString(),
      salary: 9000,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId('emp'),
      employeeNumber: 'EMP005',
      firstName: 'Saud',
      lastName: 'Al-Rashid',
      email: 'saud.alrashid@almsaralzaki.com',
      phone: '+966505555555',
      address: 'Al Yarmouk, Office 5',
      city: 'Riyadh',
      state: 'Riyadh',
      zipCode: '12345',
      country: 'Saudi Arabia',
      position: 'Sales Representative',
      department: 'Sales',
      hireDate: new Date('2022-02-14').toISOString(),
      salary: 10000,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  let success = 0
  for (const employee of employees) {
    try {
      const { data, error } = await supabase.from('employees').upsert(employee, { onConflict: 'id' })
      if (error && !error.message.includes('duplicate')) {
        console.log(`⚠️  ${employee.firstName} ${employee.lastName}: ${error.message.substring(0, 60)}`)
      } else {
        console.log(`✅ ${employee.firstName} ${employee.lastName} (${employee.position})`)
        success++
      }
    } catch (err) {
      console.log(`❌ ${employee.firstName} ${employee.lastName}: ${err.message.substring(0, 60)}`)
    }
  }
  return success
}

// Main function
async function main() {
  console.log('\n🌱 بدء إضافة البيانات التجريبية...\n')
  console.log('='.repeat(60))
  console.log(`📍 Supabase URL: ${supabaseUrl}`)
  console.log('='.repeat(60))

  const results = {
    users: 0,
    customers: 0,
    vendors: 0,
    vehicles: 0,
    employees: 0,
  }

  try {
    results.users = await seedUsers()
    results.customers = await seedCustomers()
    results.vendors = await seedVendors()
    results.vehicles = await seedVehicles()
    results.employees = await seedEmployees()

    console.log('\n' + '='.repeat(60))
    console.log('\n📊 ملخص النتائج:\n')
    console.log(`👥 المستخدمون: ${results.users}/5`)
    console.log(`👤 العملاء: ${results.customers}/5`)
    console.log(`🏢 الموردون: ${results.vendors}/5`)
    console.log(`🚗 المركبات: ${results.vehicles}/5`)
    console.log(`👷 الموظفون: ${results.employees}/5`)

    const total = Object.values(results).reduce((a, b) => a + b, 0)
    console.log(`\n✅ إجمالي: ${total}/25 سجل تم إضافتها\n`)

  } catch (error) {
    console.error('\n❌ خطأ:', error.message)
    process.exit(1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ خطأ:', error.message)
    process.exit(1)
  })
