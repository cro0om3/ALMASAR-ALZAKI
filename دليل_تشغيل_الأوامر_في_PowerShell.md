# 📖 دليل تشغيل الأوامر في PowerShell

## 🎯 الهدف: اختبار قاعدة البيانات محلياً

---

## 📋 الخطوات بالتفصيل:

### الخطوة 1: فتح PowerShell

#### الطريقة 1: من مجلد المشروع (الأسهل) ⭐

1. افتح **File Explorer** (مستكشف الملفات)
2. اذهب إلى مجلد المشروع:
   ```
   C:\Users\FHD_Admin\Documents\OneDrive\Projects\uncle-website-clean
   ```
3. اضغط على شريط العنوان (Address Bar) في الأعلى
4. اكتب: `powershell` ثم اضغط **Enter**
5. سيُفتح PowerShell في نفس المجلد! ✅

#### الطريقة 2: من قائمة Start

1. اضغط على زر **Start** (أو Windows)
2. اكتب: `PowerShell`
3. اضغط **Enter**
4. في PowerShell، اكتب:
   ```powershell
   cd "C:\Users\FHD_Admin\Documents\OneDrive\Projects\uncle-website-clean"
   ```
5. اضغط **Enter**

---

### الخطوة 2: إنشاء ملف .env.local

#### الطريقة 1: من PowerShell

في PowerShell، اكتب هذا الأمر (انسخه كاملاً):

```powershell
@"
# Next.js Environment Variables
NODE_ENV=development
NEXT_OUTPUT_MODE=standalone
DATABASE_URL=postgresql://postgres:Fhd%402992692Fhd@db.tundlptcusiogiaagsba.supabase.co:5432/postgres
"@ | Out-File -FilePath .env.local -Encoding utf8
```

ثم اضغط **Enter**

#### الطريقة 2: يدوياً (أسهل) ⭐

1. افتح **File Explorer**
2. اذهب إلى مجلد المشروع
3. اضغط بزر الماوس الأيمن → **New** → **Text Document**
4. اسم الملف: `.env.local` (مع النقطة في البداية!)
5. افتح الملف واكتب:
   ```
   NODE_ENV=development
   NEXT_OUTPUT_MODE=standalone
   DATABASE_URL=postgresql://postgres:Fhd%402992692Fhd@db.tundlptcusiogiaagsba.supabase.co:5432/postgres
   ```
6. احفظ الملف

---

### الخطوة 3: تشغيل الاختبار

في PowerShell، اكتب:

```powershell
npm run db:test
```

ثم اضغط **Enter**

---

## ✅ النتيجة المتوقعة:

إذا كان كل شيء يعمل، سترى:

```
🔍 Testing Supabase Database Connection...

✅ DATABASE_URL is set
📍 Database: Supabase
🔌 Connecting to database...

✅ Database connection successful!

📋 Checking tables...

Found 13 tables:

  ✅ users
  ✅ customers
  ✅ vendors
  ... (جميع الجداول)

🎉 All tests passed! Database is ready to use!
```

---

## 🐛 إذا واجهت مشاكل:

### المشكلة: "npm: command not found"
**الحل:**
- تأكد من أن Node.js مثبت
- أعد فتح PowerShell بعد تثبيت Node.js

### المشكلة: "DATABASE_URL is not set"
**الحل:**
- تأكد من وجود ملف `.env.local` في مجلد المشروع
- تأكد من أن DATABASE_URL موجود في الملف

### المشكلة: "Table does not exist"
**الحل:**
- الجداول غير موجودة في Supabase
- اذهب إلى Supabase SQL Editor وأنشئ الجداول

---

## 📸 صور توضيحية (خطوات):

### 1. فتح PowerShell من مجلد المشروع:
```
1. افتح File Explorer
2. اذهب إلى: C:\Users\FHD_Admin\Documents\OneDrive\Projects\uncle-website-clean
3. اضغط على شريط العنوان
4. اكتب: powershell
5. اضغط Enter
```

### 2. إنشاء ملف .env.local:
```
1. في مجلد المشروع
2. New → Text Document
3. اسمه: .env.local
4. افتحه واكتب DATABASE_URL
5. احفظ
```

### 3. تشغيل الاختبار:
```
في PowerShell:
npm run db:test
```

---

## 🎯 ملخص سريع:

1. ✅ افتح PowerShell من مجلد المشروع
2. ✅ أنشئ ملف `.env.local` مع DATABASE_URL
3. ✅ شغّل `npm run db:test`
4. ✅ انتظر النتيجة

---

**💡 نصيحة:** إذا لم تكن الجداول موجودة، أنشئها من Supabase SQL Editor أولاً!
