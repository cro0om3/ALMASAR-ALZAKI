// Test PIN Code Login
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Supabase credentials غير موجودة');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testLogin() {
  try {
    console.log('🔐 اختبار تسجيل الدخول بـ PIN Code: 1234\n');
    
    // Get all users
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error('❌ خطأ:', error.message);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('❌ لا يوجد مستخدمين في قاعدة البيانات');
      return;
    }
    
    console.log(`✅ تم العثور على ${users.length} مستخدم\n`);
    
    // Test PIN 1234
    const testPin = '1234';
    let found = false;
    
    for (const user of users) {
      if (!user.password) continue;
      
      try {
        const isValid = await bcrypt.compare(testPin, user.password);
        if (isValid) {
          console.log('✅ PIN Code 1234 يعمل!');
          console.log(`   المستخدم: ${user.name} (${user.email})`);
          console.log(`   الدور: ${user.role}\n`);
          found = true;
          break;
        }
      } catch (err) {
        continue;
      }
    }
    
    if (!found) {
      console.log('❌ PIN Code 1234 لا يعمل مع أي مستخدم');
      console.log('\n💡 الحل:');
      console.log('   شغّل: node scripts/EXECUTE-COMPLETE-SETUP.js');
      console.log('   لإعادة إنشاء المستخدمين بـ PIN: 1234\n');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

testLogin().catch(console.error);
