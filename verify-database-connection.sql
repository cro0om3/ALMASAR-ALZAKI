-- SQL Script to verify database connection and add test data
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/tundlptcusiogiaagsba/sql

-- ============================================
-- 1. Check if tables exist
-- ============================================
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      'users', 'customers', 'vendors', 'vehicles', 'employees',
      'quotations', 'quotation_items', 'invoices', 'invoice_items',
      'purchase_orders', 'purchase_order_items', 'receipts', 'payslips'
    ) THEN '✅ Exists'
    ELSE '❌ Missing'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'users', 'customers', 'vendors', 'vehicles', 'employees',
    'quotations', 'quotation_items', 'invoices', 'invoice_items',
    'purchase_orders', 'purchase_order_items', 'receipts', 'payslips'
  )
ORDER BY table_name;

-- ============================================
-- 2. Check if admin user exists
-- ============================================
SELECT 
  id,
  email,
  name,
  role,
  CASE 
    WHEN password IS NOT NULL AND length(password) > 0 THEN '✅ Has password'
    ELSE '❌ No password'
  END as password_status,
  "createdAt"
FROM "users" 
WHERE email = 'admin@example.com';

-- ============================================
-- 3. Count records in each table
-- ============================================
SELECT 
  'users' as table_name, COUNT(*) as record_count FROM "users"
UNION ALL
SELECT 'customers', COUNT(*) FROM "customers"
UNION ALL
SELECT 'vendors', COUNT(*) FROM "vendors"
UNION ALL
SELECT 'vehicles', COUNT(*) FROM "vehicles"
UNION ALL
SELECT 'employees', COUNT(*) FROM "employees"
UNION ALL
SELECT 'quotations', COUNT(*) FROM "quotations"
UNION ALL
SELECT 'invoices', COUNT(*) FROM "invoices"
UNION ALL
SELECT 'purchase_orders', COUNT(*) FROM "purchase_orders"
UNION ALL
SELECT 'receipts', COUNT(*) FROM "receipts"
UNION ALL
SELECT 'payslips', COUNT(*) FROM "payslips"
ORDER BY table_name;

-- ============================================
-- 4. Test connection by inserting a test record (optional)
-- ============================================
-- Uncomment the following if you want to add a test customer:
/*
INSERT INTO "customers" (id, name, email, phone, address, city, state, "zipCode", country, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'Test Customer',
  'test@example.com',
  '+1234567890',
  '123 Test St',
  'Dubai',
  'Dubai',
  '00000',
  'UAE',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING
RETURNING id, name, email;
*/

-- ============================================
-- 5. Verify database connection string format
-- ============================================
-- This query will help verify the connection is working
SELECT 
  current_database() as database_name,
  current_user as connected_user,
  version() as postgres_version,
  now() as current_time;
