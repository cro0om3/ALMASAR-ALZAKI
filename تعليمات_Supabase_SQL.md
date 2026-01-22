# 📝 تعليمات استخدام SQL في Supabase

## 🎯 الخطوات السريعة

### 1️⃣ افتح Supabase SQL Editor

1. اذهب إلى **Supabase Dashboard**: https://supabase.com/dashboard
2. اختر مشروعك
3. من القائمة الجانبية، اضغط على **SQL Editor**

---

### 2️⃣ انسخ والصق الكود

1. افتح ملف `supabase-schema.sql` من المشروع
2. انسخ **جميع** محتويات الملف (Ctrl+A ثم Ctrl+C)
3. الصق الكود في **Supabase SQL Editor**
4. اضغط على زر **RUN** أو **Execute** (أو اضغط F5)

---

### 3️⃣ تحقق من نجاح العملية

بعد تشغيل الكود، يجب أن ترى رسالة نجاح. للتحقق من الجداول:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

يجب أن ترى الجداول التالية:
- ✅ `users`
- ✅ `customers`
- ✅ `vendors`
- ✅ `vehicles`
- ✅ `employees`
- ✅ `quotations`
- ✅ `quotation_items`
- ✅ `invoices`
- ✅ `invoice_items`
- ✅ `purchase_orders`
- ✅ `purchase_order_items`
- ✅ `receipts`
- ✅ `payslips`

---

## ⚠️ ملاحظات مهمة

### ✅ ما الذي يقوم به هذا الكود؟

1. **ينشئ جميع الجداول** المطلوبة للتطبيق
2. **ينشئ العلاقات** (Foreign Keys) بين الجداول
3. **ينشئ Indexes** لتحسين الأداء
4. **ينشئ Triggers** لتحديث `updatedAt` تلقائياً

### 🔄 إذا كانت الجداول موجودة مسبقاً

الكود يستخدم `CREATE TABLE IF NOT EXISTS`، لذلك:
- ✅ **لن يحذف** الجداول الموجودة
- ✅ **لن يعدل** الجداول الموجودة
- ⚠️ إذا أردت إعادة إنشاء الجداول، يجب حذفها أولاً

### 🗑️ لحذف جميع الجداول (إذا لزم الأمر)

```sql
-- ⚠️ تحذير: هذا سيحذف جميع البيانات!
DROP TABLE IF EXISTS "receipts" CASCADE;
DROP TABLE IF EXISTS "payslips" CASCADE;
DROP TABLE IF EXISTS "purchase_order_items" CASCADE;
DROP TABLE IF EXISTS "purchase_orders" CASCADE;
DROP TABLE IF EXISTS "invoice_items" CASCADE;
DROP TABLE IF EXISTS "invoices" CASCADE;
DROP TABLE IF EXISTS "quotation_items" CASCADE;
DROP TABLE IF EXISTS "quotations" CASCADE;
DROP TABLE IF EXISTS "employees" CASCADE;
DROP TABLE IF EXISTS "vehicles" CASCADE;
DROP TABLE IF EXISTS "vendors" CASCADE;
DROP TABLE IF EXISTS "customers" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
```

---

## 🔗 بعد إنشاء الجداول

### 1. أضف DATABASE_URL في Vercel

1. اذهب إلى **Supabase Dashboard** → **Settings** → **Database**
2. انسخ **Connection String** (URI)
3. اذهب إلى **Vercel Dashboard** → **Project Settings** → **Environment Variables**
4. أضف:
   - **Name**: `DATABASE_URL`
   - **Value**: الصق Connection String من Supabase
   - **Environment**: Production, Preview, Development

### 2. اختبر قاعدة البيانات

بعد ربط قاعدة البيانات، اختبر من:
- **API Endpoint**: `https://your-app.vercel.app/api/test-db`
- أو من **Supabase SQL Editor**:
  ```sql
  SELECT COUNT(*) FROM "customers";
  ```

---

## 🐛 حل المشاكل

### المشكلة: "relation already exists"
**الحل**: الجداول موجودة مسبقاً. الكود آمن ولن يسبب مشاكل.

### المشكلة: "permission denied"
**الحل**: تأكد من أنك تستخدم حساب Admin في Supabase.

### المشكلة: "syntax error"
**الحل**: تأكد من نسخ **جميع** الكود من الملف بدون أخطاء.

---

## 📚 طريقة بديلة: استخدام Prisma

بدلاً من إنشاء الجداول يدوياً، يمكنك استخدام Prisma:

```bash
# 1. أضف DATABASE_URL في ملف .env
DATABASE_URL=postgresql://...

# 2. شغّل Prisma
npx prisma db push
```

هذه الطريقة **أسهل** و**أكثر أماناً** لأن Prisma سيتأكد من تطابق الجداول مع Schema.

---

## ✅ الخلاصة

1. ✅ افتح **Supabase SQL Editor**
2. ✅ انسخ والصق كود من `supabase-schema.sql`
3. ✅ اضغط **RUN**
4. ✅ تحقق من الجداول
5. ✅ أضف **DATABASE_URL** في Vercel

**🎉 قاعدة البيانات جاهزة!**
