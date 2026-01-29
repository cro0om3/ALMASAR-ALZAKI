// 🚀 Complete Deployment Setup Script
// This script helps you deploy the entire project using MCP Servers

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const readline = require('readline');

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function main() {
  console.log('🚀 ========================================');
  console.log('🚀 Complete Deployment Setup');
  console.log('🚀 ========================================\n');

  console.log('هذا السكريبت سيرشدك في عملية الرفع الكاملة:\n');

  console.log('📋 Checklist قبل البدء:');
  console.log('1. ✅ DigitalOcean MCP Server مثبت في Cursor');
  console.log('2. ✅ Namecheap MCP Server مثبت في Cursor');
  console.log('3. ✅ حساب DigitalOcean مع رصيد كافي');
  console.log('4. ✅ حساب Namecheap مع API Access مفعّل');
  console.log('5. ✅ المشروع يعمل محلياً\n');

  const ready = await askQuestion('هل كل شيء جاهز? (y/n): ');
  
  if (ready.toLowerCase() !== 'y') {
    console.log('\n⚠️  يرجى إكمال المتطلبات أولاً\n');
    return;
  }

  console.log('\n🎯 الخطوات التالية:\n');
  console.log('1. افتح Cursor Composer');
  console.log('2. استخدم الأوامر التالية:\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 الأوامر الجاهزة للنسخ:\n');

  console.log('أولاً: إنشاء قاعدة البيانات');
  console.log('────────────────────────────────────────');
  console.log('"أنشئ PostgreSQL database على DigitalOcean باسم uncle_website مع 1GB storage"\n');

  console.log('ثانياً: إنشاء Droplet');
  console.log('────────────────────────────────────────');
  console.log('"أنشئ Droplet على DigitalOcean مع Ubuntu 22.04 و 2GB RAM و Node.js 18"\n');

  console.log('ثالثاً: شراء Domain');
  console.log('────────────────────────────────────────');
  console.log('"اشتري domain example.com من Namecheap"\n');

  console.log('رابعاً: ربط Domain');
  console.log('────────────────────────────────────────');
  console.log('"اربط domain example.com مع IP Droplet"\n');

  console.log('خامساً: Deploy المشروع');
  console.log('────────────────────────────────────────');
  console.log('"ارفع المشروع الحالي على DigitalOcean App Platform واربطه مع Database و Domain"\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('💡 نصائح:');
  console.log('- استخدم Composer في Cursor');
  console.log('- MCP Servers ستعمل تلقائياً');
  console.log('- يمكنك طلب عدة أشياء في مرة واحدة\n');

  console.log('🎉 كل شيء جاهز! ابدأ من Cursor Composer 🚀\n');
}

main().catch(console.error);
