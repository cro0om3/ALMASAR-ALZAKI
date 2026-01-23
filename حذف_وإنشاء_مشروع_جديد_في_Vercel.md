# 🗑️ حذف وإنشاء مشروع جديد في Vercel

## ✅ خطوات حذف المشروع القديم:

### 1. اذهب إلى Vercel Dashboard
- افتح: **https://vercel.com/dashboard**

### 2. اختر المشروع القديم
- ابحث عن المشروع الذي تريد حذفه
- اضغط على اسم المشروع

### 3. اذهب إلى Settings
- من القائمة الجانبية، اضغط على **Settings** ⚙️
- اذهب إلى أسفل الصفحة
- ابحث عن قسم **Danger Zone**

### 4. احذف المشروع
- اضغط على **Delete Project**
- أكد الحذف (سيطلب منك كتابة اسم المشروع للتأكيد)
- اضغط **Delete**

---

## 🆕 خطوات إنشاء مشروع جديد:

### 1. اذهب إلى Dashboard
- افتح: **https://vercel.com/dashboard**

### 2. اضغط Add New Project
- اضغط على **Add New** → **Project**

### 3. اختر Repository
- اختر Repository من GitHub (مشروعك: **ALMASAR-ALZAKI**)
- اضغط **Import**

### 4. إعدادات المشروع
- **Project Name**: اكتب اسم المشروع (مثلاً: `almasar-alzaki`)
- **Framework Preset**: Next.js (سيتم اكتشافه تلقائياً)
- **Root Directory**: `.` (افتراضي)
- **Build Command**: `npm run vercel-build` (أو اتركه فارغاً - سيستخدم `package.json`)
- **Output Directory**: `.next` (افتراضي)
- **Install Command**: `npm install` (افتراضي)

### 5. أضف Environment Variables (قبل Deploy!)

**⚠️ مهم جداً:** أضف Environment Variables قبل الضغط على **Deploy**!

#### أ. اضغط **Environment Variables** (أسفل إعدادات المشروع)

#### ب. أضف Environment Variables التالية:

##### 1. DATABASE_URL:
- اضغط **Add New**
- **Key**: `DATABASE_URL`
- **Value**: 
  ```
  postgresql://postgres:Fhd%23%232992692@db.tundlptcusiogiaagsba.supabase.co:5432/postgres?sslmode=require
  ```
- **Environment**: اختر **Production, Preview, Development** (الكل ✅)
- اضغط **Save**

##### 2. NEXT_PUBLIC_SUPABASE_URL:
- اضغط **Add New**
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: 
  ```
  https://tundlptcusiogiaagsba.supabase.co
  ```
- **Environment**: اختر **Production, Preview, Development** (الكل ✅)
- اضغط **Save**

##### 3. NEXT_PUBLIC_SUPABASE_ANON_KEY:
- اضغط **Add New**
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: 
  ```
  sb_publishable_l-7BTT9CzD5fkuKxGpOfMg_nsz72V-Q
  ```
- **Environment**: اختر **Production, Preview, Development** (الكل ✅)
- اضغط **Save**

##### 4. SUPABASE_SERVICE_ROLE_KEY:
- اضغط **Add New**
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: 
  ```
  sb_secret_8hIdHJTfUdAwUTyHjHaAIw_j0VDaTmx
  ```
- **Environment**: اختر **Production, Preview, Development** (الكل ✅)
- **Sensitive**: ✅ فعّل (لأنه key سري)
- اضغط **Save**

### 6. Deploy المشروع
- بعد إضافة جميع Environment Variables
- اضغط **Deploy**
- انتظر حتى يكتمل الرفع (2-5 دقائق)

---

## ✅ بعد اكتمال الرفع:

### 1. تحقق من الرفع
- انتظر حتى يظهر **Ready** أو **Success**
- اضغط على رابط المشروع

### 2. اختبر تسجيل الدخول
- افتح رابط التطبيق
- جرّب تسجيل الدخول بـ PIN Code: `1234`

### 3. إذا لم يعمل
- اذهب إلى **Deployments** → آخر Deployment → **Logs**
- تحقق من الأخطاء

---

## 📋 Checklist:

- [ ] حذفت المشروع القديم
- [ ] أنشأت مشروع جديد
- [ ] أضفت `DATABASE_URL` قبل Deploy
- [ ] أضفت `NEXT_PUBLIC_SUPABASE_URL` قبل Deploy
- [ ] أضفت `NEXT_PUBLIC_SUPABASE_ANON_KEY` قبل Deploy
- [ ] أضفت `SUPABASE_SERVICE_ROLE_KEY` قبل Deploy
- [ ] جميع Environment Variables محددة لـ **All Environments**
- [ ] تم Deploy المشروع
- [ ] تم اختبار تسجيل الدخول

---

## 🎯 القيم المطلوبة (للنسخ السريع):

### DATABASE_URL:
```
postgresql://postgres:Fhd%23%232992692@db.tundlptcusiogiaagsba.supabase.co:5432/postgres?sslmode=require
```

### NEXT_PUBLIC_SUPABASE_URL:
```
https://tundlptcusiogiaagsba.supabase.co
```

### NEXT_PUBLIC_SUPABASE_ANON_KEY:
```
sb_publishable_l-7BTT9CzD5fkuKxGpOfMg_nsz72V-Q
```

### SUPABASE_SERVICE_ROLE_KEY:
```
sb_secret_8hIdHJTfUdAwUTyHjHaAIw_j0VDaTmx
```

---

## ⚠️ ملاحظات مهمة:

1. **أضف Environment Variables قبل Deploy:**
   - هذا مهم جداً!
   - إذا نسيت، يمكنك إضافتها بعد Deploy ثم Redeploy

2. **Redeploy بعد إضافة Environment Variables:**
   - إذا أضفت Environment Variables بعد Deploy
   - اذهب إلى **Deployments** → **Redeploy**

3. **تأكد من القيم:**
   - انسخ القيم بالضبط كما هي
   - لا تضيف مسافات إضافية

---

## 🎉 النتيجة:

بعد إنشاء المشروع الجديد وإضافة Environment Variables:
- ✅ قاعدة البيانات ستعمل
- ✅ Supabase Client سيعمل
- ✅ تسجيل الدخول سيعمل
- ✅ التطبيق جاهز للإنتاج! 🚀

---

**💡 نصيحة:** احفظ هذا الملف للرجوع إليه عند إنشاء المشروع الجديد!
