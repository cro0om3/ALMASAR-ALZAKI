-- Run this in Supabase Dashboard > SQL Editor
-- Creates app_settings so logo and settings sync across browsers/devices

CREATE TABLE IF NOT EXISTS "app_settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_app_settings_updated_at ON "app_settings";
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON "app_settings"
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

ALTER TABLE IF EXISTS "app_settings" DISABLE ROW LEVEL SECURITY;
