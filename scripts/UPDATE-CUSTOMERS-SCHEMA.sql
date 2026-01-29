-- ============================================
-- تحديث جدول customers لجعل الحقول اختيارية
-- وإضافة الحقول المفقودة
-- ============================================
-- انسخ هذا الكود والصقه في Supabase SQL Editor
-- ============================================

-- جعل الحقول الأساسية اختيارية (nullable)
ALTER TABLE IF EXISTS "customers" 
  ALTER COLUMN "name" DROP NOT NULL,
  ALTER COLUMN "email" DROP NOT NULL,
  ALTER COLUMN "phone" DROP NOT NULL,
  ALTER COLUMN "address" DROP NOT NULL,
  ALTER COLUMN "city" DROP NOT NULL,
  ALTER COLUMN "state" DROP NOT NULL,
  ALTER COLUMN "zipCode" DROP NOT NULL,
  ALTER COLUMN "country" DROP NOT NULL;

-- إضافة الحقول الاختيارية (Identity and residence)
ALTER TABLE IF EXISTS "customers" 
  ADD COLUMN IF NOT EXISTS "idNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "passportNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "residenceIssueDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "residenceExpiryDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "nationality" TEXT;

-- تحديث updatedAt ليكون له قيمة افتراضية
ALTER TABLE IF EXISTS "customers" 
  ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- ============================================
-- ✅ تم تحديث جدول customers بنجاح!
-- ============================================
