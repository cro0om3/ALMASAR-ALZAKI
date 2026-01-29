-- ============================================
-- SQL Schema for Supabase Database
-- انسخ هذا الكود والصقه في Supabase SQL Editor
-- ============================================

-- Enable UUID extension (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. جدول المستخدمين (Users)
-- ============================================
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- ============================================
-- 2. جدول العملاء (Customers)
-- ============================================
CREATE TABLE IF NOT EXISTS "customers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT UNIQUE,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT,
    -- Identity and residence fields (optional)
    "idNumber" TEXT,
    "passportNumber" TEXT,
    "residenceIssueDate" TIMESTAMP(3),
    "residenceExpiryDate" TIMESTAMP(3),
    "nationality" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. جدول الموردين (Vendors)
-- ============================================
CREATE TABLE IF NOT EXISTS "vendors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT UNIQUE,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT,
    "contactPerson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. جدول المركبات (Vehicles)
-- ============================================
CREATE TABLE IF NOT EXISTS "vehicles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "licensePlate" TEXT NOT NULL UNIQUE,
    "vin" TEXT NOT NULL UNIQUE,
    "color" TEXT NOT NULL,
    "mileage" INTEGER NOT NULL DEFAULT 0,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "purchasePrice" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- ============================================
-- 5. جدول الموظفين (Employees)
-- ============================================
CREATE TABLE IF NOT EXISTS "employees" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeNumber" TEXT NOT NULL UNIQUE,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "hireDate" TIMESTAMP(3) NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- ============================================
-- 6. جدول عروض الأسعار (Quotations)
-- ============================================
CREATE TABLE IF NOT EXISTS "quotations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quotationNumber" TEXT NOT NULL UNIQUE,
    "customerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "terms" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "quotations_customerId_fkey" FOREIGN KEY ("customerId") 
        REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- 7. جدول عناصر عروض الأسعار (Quotation Items)
-- ============================================
CREATE TABLE IF NOT EXISTS "quotation_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quotationId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "quotation_items_quotationId_fkey" FOREIGN KEY ("quotationId") 
        REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- 8. جدول الفواتير (Invoices)
-- ============================================
CREATE TABLE IF NOT EXISTS "invoices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL UNIQUE,
    "quotationId" TEXT,
    "customerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "terms" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "invoices_quotationId_fkey" FOREIGN KEY ("quotationId") 
        REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "invoices_customerId_fkey" FOREIGN KEY ("customerId") 
        REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- 9. جدول عناصر الفواتير (Invoice Items)
-- ============================================
CREATE TABLE IF NOT EXISTS "invoice_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") 
        REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- 10. جدول أوامر الشراء (Purchase Orders)
-- ============================================
CREATE TABLE IF NOT EXISTS "purchase_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL UNIQUE,
    "vendorId" TEXT,
    "customerId" TEXT,
    "quotationId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "expectedDelivery" TIMESTAMP(3) NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "terms" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "purchase_orders_vendorId_fkey" FOREIGN KEY ("vendorId") 
        REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "purchase_orders_customerId_fkey" FOREIGN KEY ("customerId") 
        REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "purchase_orders_quotationId_fkey" FOREIGN KEY ("quotationId") 
        REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- 11. جدول عناصر أوامر الشراء (Purchase Order Items)
-- ============================================
CREATE TABLE IF NOT EXISTS "purchase_order_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "purchaseOrderId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "purchase_order_items_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") 
        REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- 12. جدول إيصالات الدفع (Receipts)
-- ============================================
CREATE TABLE IF NOT EXISTS "receipts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "receiptNumber" TEXT NOT NULL UNIQUE,
    "invoiceId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "bankName" TEXT,
    "notes" TEXT,
    "paymentImageUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'issued',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "receipts_invoiceId_fkey" FOREIGN KEY ("invoiceId") 
        REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "receipts_customerId_fkey" FOREIGN KEY ("customerId") 
        REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- 13. جدول كشوف المرتبات (Payslips)
-- ============================================
CREATE TABLE IF NOT EXISTS "payslips" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payslipNumber" TEXT NOT NULL UNIQUE,
    "employeeId" TEXT NOT NULL,
    "payPeriodStart" TIMESTAMP(3) NOT NULL,
    "payPeriodEnd" TIMESTAMP(3) NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "baseSalary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overtime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bonuses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netPay" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "payslips_employeeId_fkey" FOREIGN KEY ("employeeId") 
        REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- 14. جدول المشاريع (Projects)
-- ============================================
CREATE TABLE IF NOT EXISTS "projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectNumber" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "billingType" TEXT NOT NULL DEFAULT 'hours',
    "hourlyRate" DOUBLE PRECISION,
    "dailyRate" DOUBLE PRECISION,
    "fixedAmount" DOUBLE PRECISION,
    "poNumber" TEXT,
    "poDate" TIMESTAMP(3),
    "poReceived" BOOLEAN NOT NULL DEFAULT false,
    "assignedVehicles" JSONB DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "terms" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "projects_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE CASCADE,
    CONSTRAINT "projects_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE
);

-- ============================================
-- 15. جدول سجلات الاستخدام (Usage Entries)
-- ============================================
CREATE TABLE IF NOT EXISTS "usage_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hours" DOUBLE PRECISION,
    "days" DOUBLE PRECISION,
    "startTime" TEXT,
    "endTime" TEXT,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "rate" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "invoiced" BOOLEAN NOT NULL DEFAULT false,
    "invoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "usage_entries_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE
);

-- ============================================
-- 16. جدول الفواتير الشهرية (Monthly Invoices)
-- ============================================
CREATE TABLE IF NOT EXISTS "monthly_invoices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "usageEntries" JSONB DEFAULT '[]',
    "totalHours" DOUBLE PRECISION,
    "totalDays" DOUBLE PRECISION,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "date" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "monthly_invoices_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE,
    CONSTRAINT "monthly_invoices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "projects_quotationId_idx" ON "projects"("quotationId");
CREATE INDEX IF NOT EXISTS "projects_customerId_idx" ON "projects"("customerId");
CREATE INDEX IF NOT EXISTS "usage_entries_projectId_idx" ON "usage_entries"("projectId");
CREATE INDEX IF NOT EXISTS "monthly_invoices_projectId_idx" ON "monthly_invoices"("projectId");

-- ============================================
-- 17. جدول إعدادات التطبيق (App Settings) - اللوقو والإعدادات
-- ============================================
CREATE TABLE IF NOT EXISTS "app_settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Storage: إنشاء bucket للوقو من لوحة Supabase
-- ============================================
-- من Storage > New bucket أنشئ bucket باسم: company-assets
-- واختر Public حتى يكون رابط اللوقو متاحاً للعرض.
-- ============================================

-- ============================================
-- إنشاء Indexes لتحسين الأداء
-- ============================================
CREATE INDEX IF NOT EXISTS "quotations_customerId_idx" ON "quotations"("customerId");
CREATE INDEX IF NOT EXISTS "quotation_items_quotationId_idx" ON "quotation_items"("quotationId");
CREATE INDEX IF NOT EXISTS "invoices_customerId_idx" ON "invoices"("customerId");
CREATE INDEX IF NOT EXISTS "invoices_quotationId_idx" ON "invoices"("quotationId");
CREATE INDEX IF NOT EXISTS "invoice_items_invoiceId_idx" ON "invoice_items"("invoiceId");
CREATE INDEX IF NOT EXISTS "purchase_orders_vendorId_idx" ON "purchase_orders"("vendorId");
CREATE INDEX IF NOT EXISTS "purchase_orders_customerId_idx" ON "purchase_orders"("customerId");
CREATE INDEX IF NOT EXISTS "purchase_orders_quotationId_idx" ON "purchase_orders"("quotationId");
CREATE INDEX IF NOT EXISTS "purchase_order_items_purchaseOrderId_idx" ON "purchase_order_items"("purchaseOrderId");
CREATE INDEX IF NOT EXISTS "receipts_invoiceId_idx" ON "receipts"("invoiceId");
CREATE INDEX IF NOT EXISTS "receipts_customerId_idx" ON "receipts"("customerId");
CREATE INDEX IF NOT EXISTS "payslips_employeeId_idx" ON "payslips"("employeeId");

-- ============================================
-- إنشاء Function لتحديث updatedAt تلقائياً
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- إنشاء Triggers لتحديث updatedAt تلقائياً
-- ============================================
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON "customers" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON "vendors" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON "vehicles" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON "employees" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON "quotations" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotation_items_updated_at BEFORE UPDATE ON "quotation_items" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON "invoices" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_items_updated_at BEFORE UPDATE ON "invoice_items" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON "purchase_orders" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_order_items_updated_at BEFORE UPDATE ON "purchase_order_items" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON "receipts" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payslips_updated_at BEFORE UPDATE ON "payslips" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON "projects" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_entries_updated_at BEFORE UPDATE ON "usage_entries" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_invoices_updated_at BEFORE UPDATE ON "monthly_invoices" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON "app_settings" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- تعطيل Row Level Security (RLS)
-- الكل يشوف كل شيء - شركة واحدة
-- ============================================
ALTER TABLE IF EXISTS "app_settings" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "users" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "customers" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "vendors" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "vehicles" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "employees" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "quotations" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "quotation_items" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "invoices" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "invoice_items" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "purchase_orders" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "purchase_order_items" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "receipts" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "payslips" DISABLE ROW LEVEL SECURITY;

-- حذف أي RLS Policies موجودة (إن وجدت)
DROP POLICY IF EXISTS "Enable all operations for all users" ON "users";
DROP POLICY IF EXISTS "Enable all operations for all users" ON "customers";
DROP POLICY IF EXISTS "Enable all operations for all users" ON "vendors";
DROP POLICY IF EXISTS "Enable all operations for all users" ON "vehicles";
DROP POLICY IF EXISTS "Enable all operations for all users" ON "employees";
DROP POLICY IF EXISTS "Enable all operations for all users" ON "quotations";
DROP POLICY IF EXISTS "Enable all operations for all users" ON "quotation_items";
DROP POLICY IF EXISTS "Enable all operations for all users" ON "invoices";
DROP POLICY IF EXISTS "Enable all operations for all users" ON "invoice_items";
DROP POLICY IF EXISTS "Enable all operations for all users" ON "purchase_orders";
DROP POLICY IF EXISTS "Enable all operations for all users" ON "purchase_order_items";
DROP POLICY IF EXISTS "Enable all operations for all users" ON "receipts";
DROP POLICY IF EXISTS "Enable all operations for all users" ON "payslips";
DROP POLICY IF EXISTS "Enable all operations for all users" ON "projects";
DROP POLICY IF EXISTS "Enable all operations for all users" ON "usage_entries";
DROP POLICY IF EXISTS "Enable all operations for all users" ON "monthly_invoices";

-- ============================================
-- ✅ تم إنشاء جميع الجداول بنجاح!
-- ✅ تم تعطيل RLS - الكل يشوف كل شيء
-- ============================================
-- للتحقق من الجداول، شغّل:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' ORDER BY table_name;
-- ============================================
