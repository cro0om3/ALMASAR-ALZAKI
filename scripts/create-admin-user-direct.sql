-- ============================================
-- إنشاء مستخدم Admin بـ PIN Code 1234
-- انسخ هذا الكود والصقه في Supabase SQL Editor
-- ============================================

-- Hash PIN Code 1234 using bcrypt
-- Hash: $2b$10$IiPpxS7lKsj1Howgs0sEOOTaKbJhURuiQApIul0lTVOxIhLZK/TWC
-- تم إنشاؤه باستخدام: bcrypt.hash('1234', 10)

-- إنشاء/تحديث مستخدم Admin
INSERT INTO "users" ("id", "email", "name", "password", "role", "createdAt", "updatedAt")
VALUES (
  'admin_' || gen_random_uuid()::text,
  'admin@example.com',
  'Administrator',
  '$2b$10$IiPpxS7lKsj1Howgs0sEOOTaKbJhURuiQApIul0lTVOxIhLZK/TWC', -- PIN: 1234
  'admin',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("email") 
DO UPDATE SET
  "password" = '$2b$10$IiPpxS7lKsj1Howgs0sEOOTaKbJhURuiQApIul0lTVOxIhLZK/TWC',
  "role" = 'admin',
  "name" = 'Administrator',
  "updatedAt" = CURRENT_TIMESTAMP;

-- التحقق من إنشاء المستخدم
SELECT "id", "email", "name", "role", "createdAt" 
FROM "users" 
WHERE "email" = 'admin@example.com';
