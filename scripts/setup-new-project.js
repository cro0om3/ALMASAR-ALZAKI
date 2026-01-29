// 🚀 Setup New Project - Template Script
// Use this script for every new project to set up deployment

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const readline = require('readline');
const fs = require('fs');
const path = require('path');

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
  console.log('🚀 New Project Deployment Setup');
  console.log('🚀 ========================================\n');

  console.log('هذا السكريبت سيساعدك في إعداد أي مشروع جديد:\n');

  // Get project info
  const projectName = await askQuestion('📝 اسم المشروع: ');
  const domainName = await askQuestion('🌐 Domain Name (مثال: mycompany.com): ');
  
  console.log('\n📋 Checklist قبل البدء:\n');
  console.log('1. ✅ المشروع يعمل محلياً');
  console.log('2. ✅ MCP Servers مثبتة في Cursor');
  console.log('3. ✅ DigitalOcean API Token جاهز');
  console.log('4. ✅ Namecheap API Credentials جاهزة\n');

  const ready = await askQuestion('هل كل شيء جاهز? (y/n): ');
  
  if (ready.toLowerCase() !== 'y') {
    console.log('\n⚠️  يرجى إكمال المتطلبات أولاً\n');
    return;
  }

  console.log('\n🎯 الأوامر الجاهزة للنسخ في Cursor Composer:\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('1️⃣  إنشاء قاعدة البيانات:');
  console.log(`   "أنشئ PostgreSQL database على DigitalOcean باسم ${projectName} مع 1GB storage"\n`);

  console.log('2️⃣  إنشاء Droplet:');
  console.log('   "أنشئ Droplet على DigitalOcean مع Ubuntu 22.04 و 2GB RAM و Node.js 18"\n');

  console.log('3️⃣  شراء Domain:');
  console.log(`   "اشتري domain ${domainName} من Namecheap"\n`);

  console.log('4️⃣  ربط Domain:');
  console.log('   "اربط domain {domain} مع IP {server_ip}" (بعد الحصول على IP)\n');

  console.log('5️⃣  رفع المشروع:');
  console.log(`   "ارفع المشروع الحالي على DigitalOcean App Platform واربطه مع Database و Domain ${domainName}"\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('💡 أو استخدم أمر واحد شامل:');
  console.log(`   "أنشئ PostgreSQL database باسم ${projectName}، أنشئ Droplet، اشتري domain ${domainName}، اربط Domain، وارفع المشروع على DigitalOcean"\n`);

  // Save project info
  const projectInfo = {
    projectName,
    domainName,
    createdAt: new Date().toISOString(),
    deploymentStrategy: 'DigitalOcean + Namecheap via Cursor MCP'
  };

  const infoPath = path.join(__dirname, '..', '.project-info.json');
  fs.writeFileSync(infoPath, JSON.stringify(projectInfo, null, 2));
  console.log(`✅ تم حفظ معلومات المشروع في: ${infoPath}\n`);

  console.log('🎉 كل شيء جاهز! ابدأ من Cursor Composer 🚀\n');
}

main().catch(console.error);
