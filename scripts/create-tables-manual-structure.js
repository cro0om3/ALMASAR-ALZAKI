// 🚀 Create Tables by manually constructing table structure via Supabase REST API
// This is a workaround since Supabase REST API doesn't support DDL
// We'll use Supabase Client to insert data, but tables must exist first

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Supabase credentials غير موجودة');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  console.log('🚀 ========================================');
  console.log('🚀 إنشاء الجداول - طريقة يدوية');
  console.log('🚀 ========================================\n');

  console.log('⚠️  Supabase REST API لا يدعم إنشاء الجداول (DDL)');
  console.log('⚠️  جميع الطرق البرمجية فشلت بسبب مشاكل الاتصال\n');
  
  console.log('💡 الحل الوحيد: استخدام Supabase SQL Editor يدوياً\n');
  
  console.log('📋 الخطوات:');
  console.log('   1. اذهب إلى: https://supabase.com/dashboard/project/ebelbztbpzccdhytynnc/sql/new');
  console.log('   2. انسخ محتوى: supabase-schema.sql');
  console.log('   3. الصق في SQL Editor');
  console.log('   4. اضغط "Run"\n');
  
  console.log('   5. بعد الإنشاء، شغّل: node scripts/MASTER-SETUP.js');
  console.log('      لإضافة 5 سجلات لكل جدول\n');

  // Check if tables exist
  console.log('🔍 التحقق من وجود الجداول...');
  try {
    const { error } = await supabase.from('users').select('count').limit(1);
    if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('❌ الجداول غير موجودة - يجب إنشاؤها أولاً\n');
    } else {
      console.log('✅ الجداول موجودة! يمكنك الآن شغّل: node scripts/MASTER-SETUP.js\n');
    }
  } catch (error) {
    console.log('❌ خطأ في التحقق:', error.message);
  }
}

main().catch(console.error);
