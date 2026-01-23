-- ============================================
-- Create Default Admin User
-- Run this in Supabase SQL Editor
-- ============================================

-- Default admin user
-- Email: admin@example.com
-- PIN Code: 1234
-- Password will be hashed using bcrypt

-- Note: You need to hash the PIN code first
-- Use this Node.js code to generate the hash:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('1234', 10);
-- console.log(hash);

-- Or use this online tool: https://bcrypt-generator.com/
-- For PIN "1234", the hash is approximately: $2a$10$...

-- Insert admin user (PIN: 1234)
INSERT INTO "users" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES (
  'admin-' || gen_random_uuid()::text,
  'admin@example.com',
  'Administrator',
  '$2b$10$D.hVlxBkAGJ6cT1M3abRYupo8vKrpAq3bvSCvvT6zoXW9aBuE57W.', -- PIN: 1234
  'admin',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- Verify the user was created
SELECT id, email, name, role, "createdAt" FROM "users" WHERE email = 'admin@example.com';
