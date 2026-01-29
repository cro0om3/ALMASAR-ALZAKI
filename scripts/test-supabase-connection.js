// اختبار اتصال Supabase — انسخ ولصق: node scripts/test-supabase-connection.js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { createClient } = require('@supabase/supabase-js');

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function main() {
  console.log('========================================');
  console.log('  اختبار اتصال Supabase');
  console.log('========================================\n');

  if (!URL) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL غير موجود في .env.local أو .env');
    process.exit(1);
  }
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL:', URL);

  const key = SERVICE_KEY || ANON_KEY;
  if (!key) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY أو NEXT_PUBLIC_SUPABASE_ANON_KEY غير موجود');
    process.exit(1);
  }
  console.log('✅ مفتاح API:', key ? '(موجود)' : '(ناقص)');

  const supabase = createClient(URL, key);

  try {
    const { data, error } = await supabase.from('app_settings').select('id, settings, updatedAt').limit(1);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.log('\n⚠️ جدول app_settings غير موجود — الاتصال يعمل لكن الجدول يحتاج إنشاء (انظر supabase-schema.sql أو create-app-settings-now.js)');
        console.log('   رسالة Supabase:', error.message);
        process.exit(0);
      }
      if (error.message?.includes('Invalid API key') || error.message?.includes('invalid')) {
        console.error('\n❌ Invalid API key — تأكد أن المفتاح من نفس مشروع Supabase (Settings → API)');
        console.error('   تفاصيل:', error.message);
        process.exit(1);
      }
      throw error;
    }
    console.log('\n✅ الاتصال بـ Supabase ناجح.');
    console.log('   app_settings:', data?.length ? `${data.length} صف` : 'فارغ أو لا يوجد جدول');
  } catch (err) {
    console.error('\n❌ فشل الاتصال:', err.message || err);
    if (err.message?.includes('Invalid API key')) {
      console.error('   تأكد من NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في .env.local (ونفس المشروع في Vercel).');
    }
    process.exit(1);
  }

  console.log('\n========================================\n');
}

main();
