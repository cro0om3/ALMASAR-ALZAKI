# 🔧 كيفية حذف أو تعديل Environment Variables في Vercel

## 📋 خطوات حذف Environment Variable:

### الطريقة 1: من صفحة Environment Variables

1. اذهب إلى **Vercel Dashboard**
2. اختر مشروعك
3. اذهب إلى **Settings** → **Environment Variables**
4. ستجد قائمة بجميع Environment Variables
5. لكل متغير، ستجد:
   - **⋮** (ثلاث نقاط) على اليمين
   - أو **Delete** button
6. اضغط على **⋮** → **Delete**
7. أكد الحذف

---

## 📝 خطوات تعديل Environment Variable:

### الطريقة 1: تعديل من القائمة

1. اذهب إلى **Settings** → **Environment Variables**
2. اضغط على Environment Variable الذي تريد تعديله
3. ستفتح نافذة التعديل
4. عدّل **Value** أو **Environment**
5. اضغط **Save**

### الطريقة 2: حذف وإعادة إضافة

إذا لم تستطع التعديل:
1. احذف Environment Variable القديم
2. أضف Environment Variable جديد بالقيم الصحيحة

---

## ⚠️ إذا لم تستطع الحذف أو التعديل:

### المشكلة المحتملة 1: لا توجد صلاحيات
- تأكد أنك Owner أو Admin للمشروع
- إذا لم تكن، اطلب من Owner إعطائك صلاحيات

### المشكلة المحتملة 2: Environment Variable محمي
- بعض Environment Variables محمية ولا يمكن حذفها
- حاول تعديلها بدلاً من حذفها

### المشكلة المحتملة 3: مشكلة في الواجهة
- جرب تحديث الصفحة (F5)
- جرب من متصفح آخر
- جرب مسح Cache المتصفح

---

## 🔄 خطوات إعادة إضافة Environment Variables:

إذا حذفت Environment Variable وأردت إضافتها مرة أخرى:

### 1. اضغط **Add New**

### 2. أضف القيم:

#### DATABASE_URL:
- **Key**: `DATABASE_URL`
- **Value**: `postgresql://postgres:Fhd%23%232992692@db.tundlptcusiogiaagsba.supabase.co:5432/postgres?sslmode=require`
- **Environment**: All Environments

#### NEXT_PUBLIC_SUPABASE_URL:
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://tundlptcusiogiaagsba.supabase.co`
- **Environment**: All Environments

#### NEXT_PUBLIC_SUPABASE_ANON_KEY:
- **Key**: `NEXT_PUBLIC_SUPABASE_KEY`
- **Value**: `sb_publishable_l-7BTT9CzD5fkuKxGpOfMg_nsz72V-Q`
- **Environment**: All Environments

#### SUPABASE_SERVICE_ROLE_KEY:
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `sb_secret_8hIdHJTfUdAwUTyHjHaAIw_j0VDaTmx`
- **Environment**: All Environments
- **Sensitive**: ✅ فعّل (لأنه key سري)

---

## 🎯 بعد الحذف أو التعديل:

### 1. Redeploy المشروع:
1. اذهب إلى **Deployments**
2. اضغط على آخر Deployment
3. اضغط **⋮** → **Redeploy**

### 2. تحقق من الرفع:
- انتظر حتى يكتمل الرفع
- افتح رابط التطبيق
- جرّب تسجيل الدخول

---

## 🆘 إذا استمرت المشكلة:

### الحل البديل: استخدام Vercel CLI

1. ثبت Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. سجل دخول:
   ```bash
   vercel login
   ```

3. اربط المشروع:
   ```bash
   vercel link
   ```

4. احذف Environment Variable:
   ```bash
   vercel env rm DATABASE_URL production
   ```

5. أضف Environment Variable جديد:
   ```bash
   vercel env add DATABASE_URL production
   ```
   (سيطلب منك إدخال القيمة)

---

## 📸 لقطة شاشة للمساعدة:

إذا كنت تواجه مشكلة، أرسل لقطة شاشة من:
- صفحة Environment Variables
- رسالة الخطأ (إن وجدت)

---

**💡 نصيحة:** إذا لم تستطع حذف Environment Variable، يمكنك تعديل قيمته فقط. هذا سيعمل أيضاً!
