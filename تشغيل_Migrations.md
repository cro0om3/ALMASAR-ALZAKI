# 🗄️ كيفية تشغيل Migrations وإنشاء الجداول

## ❌ لا تحتاج لإنشاء جداول يدوياً!

**Prisma سينشئ الجداول تلقائياً** عند تشغيل Migrations.

---

## 📋 الخطوات:

### الخطوة 1: الحصول على DATABASE_URL من Neon

1. اذهب إلى: **https://console.neon.tech**
2. سجل دخول
3. اختر مشروع **"ALMASAR-AIZAKI"**
4. في الصفحة الرئيسية:
   - ابحث عن **"Connection String"** أو **"Quickstart"**
   - اضغط **"Show"** لإظهار القيمة
   - انسخ `DATABASE_URL` (سيبدأ بـ `postgresql://...`)

---

### الخطوة 2: إضافة DATABASE_URL في Vercel

1. اذهب إلى **Vercel Dashboard**
2. اضغط على المشروع **"almasar-alzaki"**
3. اذهب إلى **Settings** → **Environment Variables**
4. اضغط **"Add New"**
5. املأ:
   - **Name**: `DATABASE_URL`
   - **Value**: الصق الرابط من Neon
   - **Environment**: اختر **Production, Preview, Development** (الكل)
6. اضغط **"Save"**

---

### الخطوة 3: تشغيل Migrations

#### الطريقة 1: من Terminal (محلياً) ⭐

1. **سحب Environment Variables من Vercel:**
   ```bash
   npm install -g vercel
   vercel login
   vercel env pull .env.local
   ```

2. **تشغيل Migrations:**
   ```bash
   npx prisma db push
   ```
   
   أو إذا كنت تستخدم Migrations:
   ```bash
   npx prisma migrate deploy
   ```

#### الطريقة 2: من Neon SQL Editor

1. اذهب إلى **Neon Dashboard** → **SQL Editor**
2. الصق هذا الكود:
   ```sql
   -- Prisma سينشئ الجداول تلقائياً
   -- لكن يمكنك التحقق من وجودها:
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

#### الطريقة 3: إضافة Script في package.json

بعد إضافة DATABASE_URL في Vercel، يمكنك إضافة script في `package.json`:

```json
{
  "scripts": {
    "db:deploy": "prisma migrate deploy"
  }
}
```

ثم شغّله في Vercel بعد Deploy.

---

## ✅ بعد تشغيل Migrations:

### التحقق من الجداول:

1. اذهب إلى **Neon Dashboard** → **SQL Editor**
2. شغّل:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```

3. يجب أن ترى الجداول التالية:
   - `customers`
   - `vendors`
   - `quotations`
   - `quotation_items`
   - `invoices`
   - `invoice_items`
   - `purchase_orders`
   - `purchase_order_items`
   - `vehicles`
   - `employees`
   - `payslips`
   - `users`

---

## 🧪 اختبار قاعدة البيانات:

بعد تشغيل Migrations:

1. اذهب إلى: **https://almasar-alzaki.vercel.app/api/test-db**
2. يجب أن ترى:
   ```json
   {
     "success": true,
     "message": "Database connection successful!",
     "data": {
       "customers": 0,
       "quotations": 0,
       "invoices": 0
     }
   }
   ```

---

## 🐛 إذا واجهت مشاكل:

### المشكلة: "Table does not exist"
**الحل:**
- تأكد من أن Migrations تم تشغيلها
- شغّل `npx prisma db push` مرة أخرى

### المشكلة: "Database connection failed"
**الحل:**
- تأكد من أن `DATABASE_URL` صحيح
- تأكد من أن قاعدة البيانات نشطة في Neon

---

## 📝 ملخص:

1. ✅ **لا تحتاج** لإنشاء جداول يدوياً
2. ✅ **أضف** `DATABASE_URL` في Vercel
3. ✅ **شغّل** `npx prisma db push` محلياً
4. ✅ **اختبر** من `/api/test-db`

---

## 🎉 بعد اكتمال كل شيء:

التطبيق جاهز للاستخدام! 🚀
