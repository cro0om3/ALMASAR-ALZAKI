# 🔐 إضافة Environment Variables في Vercel

## ✅ المطلوب لإضافة Environment Variables

### 📋 Environment Variables المطلوبة:

#### 1. DATABASE_URL (مطلوب) ⭐
```
postgresql://postgres:Fhd%23%232992692@db.tundlptcusiogiaagsba.supabase.co:5432/postgres?sslmode=require
```

#### 2. NEXT_PUBLIC_SUPABASE_URL (مطلوب للـ Supabase Client)
```
https://tundlptcusiogiaagsba.supabase.co
```

#### 3. NEXT_PUBLIC_SUPABASE_ANON_KEY (مطلوب للـ Supabase Client)
```
sb_publishable_l-7BTT9CzD5fkuKxGpOfMg_nsz72V-Q
```

#### 4. SUPABASE_SERVICE_ROLE_KEY (مطلوب للـ Supabase Server)
```
sb_secret_8hIdHJTfUdAwUTyHjHaAIw_j0VDaTmx
```

---

## 🚀 خطوات الإضافة في Vercel:

### الخطوة 1: اذهب إلى Vercel Dashboard
1. افتح: **https://vercel.com/dashboard**
2. سجل دخول بحسابك

### الخطوة 2: اختر المشروع
1. ابحث عن مشروعك (مثلاً: **almasar-alzaki**)
2. اضغط على اسم المشروع

### الخطوة 3: اذهب إلى Settings
1. من القائمة الجانبية، اضغط على **Settings** ⚙️
2. اضغط على **Environment Variables** من القائمة الفرعية

### الخطوة 4: أضف Environment Variables

#### أ. أضف DATABASE_URL:
1. اضغط **Add New**
2. **Name**: `DATABASE_URL`
3. **Value**: 
   ```
   postgresql://postgres:Fhd%23%232992692@db.tundlptcusiogiaagsba.supabase.co:5432/postgres?sslmode=require
   ```
4. **Environment**: اختر **Production, Preview, Development** (الكل ✅)
5. اضغط **Save**

#### ب. أضف NEXT_PUBLIC_SUPABASE_URL:
1. اضغط **Add New**
2. **Name**: `NEXT_PUBLIC_SUPABASE_URL`
3. **Value**: 
   ```
   https://tundlptcusiogiaagsba.supabase.co
   ```
4. **Environment**: اختر **Production, Preview, Development** (الكل ✅)
5. اضغط **Save**

#### ج. أضف NEXT_PUBLIC_SUPABASE_ANON_KEY:
1. اضغط **Add New**
2. **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Value**: 
   ```
   sb_publishable_l-7BTT9CzD5fkuKxGpOfMg_nsz72V-Q
   ```
4. **Environment**: اختر **Production, Preview, Development** (الكل ✅)
5. اضغط **Save**

#### د. أضف SUPABASE_SERVICE_ROLE_KEY:
1. اضغط **Add New**
2. **Name**: `SUPABASE_SERVICE_ROLE_KEY`
3. **Value**: 
   ```
   sb_secret_8hIdHJTfUdAwUTyHjHaAIw_j0VDaTmx
   ```
4. **Environment**: اختر **Production, Preview, Development** (الكل ✅)
5. اضغط **Save**

---

## ✅ بعد إضافة Environment Variables:

### 1. Redeploy (إعادة النشر)
1. اذهب إلى **Deployments** من القائمة الجانبية
2. اضغط على آخر Deployment
3. اضغط على **⋮** (ثلاث نقاط) → **Redeploy**
4. أو انتظر حتى Vercel يرفع تلقائياً عند `git push`

### 2. تحقق من الرفع
1. بعد اكتمال الرفع، افتح رابط التطبيق
2. جرّب تسجيل الدخول بـ PIN Code: `1234`
3. إذا لم يعمل، تحقق من Logs في Vercel

---

## 📝 Checklist:

- [ ] أضفت `DATABASE_URL` في Vercel
- [ ] أضفت `NEXT_PUBLIC_SUPABASE_URL` في Vercel
- [ ] أضفت `NEXT_PUBLIC_SUPABASE_ANON_KEY` في Vercel
- [ ] أضفت `SUPABASE_SERVICE_ROLE_KEY` في Vercel
- [ ] جميع Environment Variables محددة لـ **Production, Preview, Development**
- [ ] تم Redeploy المشروع
- [ ] تم اختبار تسجيل الدخول

---

## ⚠️ ملاحظات مهمة:

1. **DATABASE_URL**: 
   - كلمة المرور: `Fhd##2992692`
   - تم ترميز `#` إلى `%23` في Connection String
   - تم إضافة `?sslmode=require` للاتصال الآمن

2. **NEXT_PUBLIC_***: 
   - هذه المتغيرات تظهر في Client-side
   - آمنة للاستخدام في المتصفح

3. **SUPABASE_SERVICE_ROLE_KEY**: 
   - هذا Key سري - لا تشاركه أبداً
   - يستخدم فقط في Server-side

---

## 🎯 النتيجة:

بعد إضافة جميع Environment Variables:
- ✅ قاعدة البيانات ستعمل
- ✅ Supabase Client سيعمل
- ✅ تسجيل الدخول سيعمل
- ✅ التطبيق جاهز للإنتاج! 🚀

---

## 🆘 إذا واجهت مشكلة:

1. **تحقق من Logs في Vercel:**
   - اذهب إلى **Deployments** → آخر Deployment → **Logs**
   - ابحث عن أخطاء متعلقة بـ Environment Variables

2. **تحقق من Environment Variables:**
   - تأكد من أن جميع المتغيرات موجودة
   - تأكد من أن القيم صحيحة (بدون مسافات إضافية)

3. **Redeploy:**
   - بعد إضافة/تعديل Environment Variables، يجب Redeploy

---

**🎉 بعد إضافة جميع Environment Variables، التطبيق سيعمل أونلاين!**
