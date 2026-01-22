# 🚀 الخطوات بعد إنشاء Supabase Project

## ✅ المشروع جاهز!
**رابط المشروع**: https://tundlptcusiogiaagsba.supabase.co

---

## 📋 الخطوات التالية:

### 1️⃣ الحصول على Connection String

1. اذهب إلى: **https://supabase.com/dashboard/project/tundlptcusiogiaagsba**
2. من القائمة الجانبية، اضغط على **Settings** (⚙️)
3. اضغط على **Database**
4. ابحث عن قسم **Connection String** أو **Connection Pooling**
5. انسخ **URI** (سيبدأ بـ `postgresql://...`)
   - استخدم **Connection Pooling** إذا كان متاحاً (أفضل للأداء)
   - أو استخدم **Direct Connection**

**✅ Connection String الكامل:**
```
postgresql://postgres:Fhd%402992692Fhd@db.tundlptcusiogiaagsba.supabase.co:5432/postgres
```

⚠️ **ملاحظة:** تم ترميز الرمز `@` في كلمة المرور إلى `%40` (URL encoding)

---

### 2️⃣ إضافة Environment Variables في Vercel

1. اذهب إلى **Vercel Dashboard**: https://vercel.com/dashboard
2. اختر مشروعك **"almasar-alzaki"** (أو اسم مشروعك)
3. اضغط على **Settings** → **Environment Variables**
4. أضف المتغيرات التالية:

#### أ. DATABASE_URL (مطلوب) ⭐
- اضغط **Add New**
- **Name**: `DATABASE_URL`
- **Value**: 
  ```
  postgresql://postgres:Fhd%402992692Fhd@db.tundlptcusiogiaagsba.supabase.co:5432/postgres
  ```
- **Environment**: اختر **Production, Preview, Development** (الكل)
- اضغط **Save**

⚠️ **ملاحظة:** تم ترميز الرمز `@` في كلمة المرور إلى `%40`

#### ب. Supabase API Keys (اختياري - للاستخدام المستقبلي)
إذا أردت استخدام Supabase Client SDK لاحقاً:

- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://tundlptcusiogiaagsba.supabase.co`
- **Environment**: Production, Preview, Development

- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `sb_publishable_l-7BTT9CzD5fkuKxGpOfMg_nsz72V-Q`
- **Environment**: Production, Preview, Development

- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `sb_secret_8hIdHJTfUdAwUTyHjHaAIw_j0VDaTmx`
- **Environment**: Production, Preview, Development (⚠️ Server-side only)

---

### 3️⃣ إنشاء الجداول في Supabase

#### الطريقة 1: استخدام SQL Editor (الأسرع) ⭐

1. اذهب إلى: **https://supabase.com/dashboard/project/tundlptcusiogiaagsba/sql**
2. اضغط على **New Query**
3. افتح ملف `supabase-schema.sql` من المشروع
4. انسخ **جميع** محتويات الملف (Ctrl+A ثم Ctrl+C)
5. الصق الكود في SQL Editor
6. اضغط **RUN** أو **Ctrl+Enter**

**للتحقق من نجاح العملية:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

يجب أن ترى 13 جدول:
- ✅ users
- ✅ customers
- ✅ vendors
- ✅ vehicles
- ✅ employees
- ✅ quotations
- ✅ quotation_items
- ✅ invoices
- ✅ invoice_items
- ✅ purchase_orders
- ✅ purchase_order_items
- ✅ receipts
- ✅ payslips

#### الطريقة 2: استخدام Prisma (بديل)

```bash
# 1. سحب Environment Variables من Vercel
vercel env pull .env.local

# 2. تشغيل Prisma
npx prisma db push
```

---

### 4️⃣ اختبار قاعدة البيانات

#### من Supabase SQL Editor:
```sql
-- التحقق من عدد الجداول
SELECT COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public';

-- التحقق من جدول معين
SELECT COUNT(*) FROM "customers";
```

#### من API Endpoint:
بعد ربط قاعدة البيانات في Vercel:
- اذهب إلى: `https://your-app.vercel.app/api/test-db`
- يجب أن ترى:
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

## 🔐 معلومات مهمة

### ✅ مفاتيح API (API Keys) - تم الحصول عليها:

**Public/Anon Key:**
```
sb_publishable_l-7BTT9CzD5fkuKxGpOfMg_nsz72V-Q
```

**Secret Key:**
```
sb_secret_8hIdHJTfUdAwUTyHjHaAIw_j0VDaTmx
```

⚠️ **ملاحظة مهمة:**
- **Public Key**: آمن للاستخدام في Frontend (Client-side)
- **Secret Key**: استخدمه فقط في Backend (Server-side) - **لا تشاركه أبداً!**

**إذا أردت استخدام Supabase Client SDK في المستقبل:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://tundlptcusiogiaagsba.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_l-7BTT9CzD5fkuKxGpOfMg_nsz72V-Q
SUPABASE_SERVICE_ROLE_KEY=sb_secret_8hIdHJTfUdAwUTyHjHaAIw_j0VDaTmx
```

**لكن حالياً المشروع يستخدم Prisma فقط، لذلك:**
- ✅ **DATABASE_URL** هو المطلوب فقط للاتصال بقاعدة البيانات
- ⚠️ API Keys اختيارية (إذا أردت استخدام Supabase Client SDK لاحقاً)

---

### حفظ كلمة مرور قاعدة البيانات:
⚠️ **إذا نسيت كلمة المرور**، يمكنك إعادة تعيينها من:
- **Supabase Dashboard** → **Settings** → **Database** → **Reset Database Password**

### Connection String Formats:

**Direct Connection:**
```
postgresql://postgres:Fhd%402992692Fhd@db.tundlptcusiogiaagsba.supabase.co:5432/postgres
```

⚠️ **ملاحظة:** تم ترميز الرمز `@` في كلمة المرور إلى `%40`

**Connection Pooling (موصى به):**
```
postgresql://postgres.tundlptcusiogiaagsba:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

---

## ✅ Checklist

- [x] حصلت على Connection String من Supabase ✅
- [ ] أضفت DATABASE_URL في Vercel Environment Variables
- [ ] (اختياري) أضفت Supabase API Keys إذا كنت ستستخدم Supabase Client SDK
- [ ] أنشأت الجداول من SQL Editor (أو Prisma)
- [ ] تحققت من وجود جميع الجداول (13 جدول)
- [ ] اختبرت قاعدة البيانات من API

---

## 🎉 بعد اكتمال كل شيء:

التطبيق جاهز للاستخدام! يمكنك الآن:
- ✅ إنشاء عملاء (Customers)
- ✅ إنشاء عروض أسعار (Quotations)
- ✅ إنشاء فواتير (Invoices)
- ✅ إدارة الموظفين والمركبات
- ✅ وغيرها من الميزات

---

## 🐛 حل المشاكل

### المشكلة: "Cannot connect to database"
**الحل:**
- تأكد من أن Connection String صحيح
- تأكد من استبدال `[YOUR-PASSWORD]` بكلمة المرور الفعلية
- تأكد من أن قاعدة البيانات نشطة في Supabase

### المشكلة: "Table does not exist"
**الحل:**
- تأكد من تشغيل SQL من `supabase-schema.sql`
- تحقق من وجود الجداول باستخدام الاستعلام أعلاه

### المشكلة: "Permission denied"
**الحل:**
- تأكد من استخدام Connection String الصحيح
- تأكد من أن كلمة المرور صحيحة

---

**🎯 الخطوة التالية:** اذهب إلى Supabase SQL Editor وأنشئ الجداول!
