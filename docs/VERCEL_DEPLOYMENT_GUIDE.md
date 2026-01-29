# دليل النشر على Vercel

دليل خطوة بخطوة لنشر مشروع **uncle-website-system** (ALMASAR-ALZAKI) على Vercel.

---

## المحتويات

1. [المتطلبات](#1-المتطلبات)
2. [ربط الريبو بـ GitHub](#2-ربط-الريبو-بـ-github)
3. [إنشاء مشروع على Vercel وربطه بالريبو](#3-إنشاء-مشروع-على-vercel-وربطه-بالريبو)
4. [إضافة متغيرات البيئة](#4-إضافة-متغيرات-البيئة)
5. [أول نشر (Deploy)](#5-أول-نشر-deploy)
6. [النشرات التالية](#6-النشرات-التالية)
7. [إعدادات البناء في المشروع](#7-إعدادات-البناء-في-المشروع)
8. [دومين مخصص (اختياري)](#8-دومين-مخصص-اختياري)
9. [استكشاف الأخطاء](#9-استكشاف-الأخطاء)

---

## 1. المتطلبات

قبل البدء تأكد من:

| المتطلب | الوصف |
|--------|--------|
| **حساب Vercel** | [إنشاء حساب](https://vercel.com/signup) أو الدخول بحساب GitHub. |
| **الريبو على GitHub** | المشروع مرفوع على GitHub (مثلاً: `cro0om3/ALMASAR-ALZAKI`). |
| **مشروع Supabase** | قاعدة البيانات والإعدادات جاهزة؛ ستحتاج الـ URL والمفاتيح. |
| **متغيرات البيئة محلياً** | أن المشروع يعمل عندك محلياً (`.env.local` أو `.env`) حتى تنقل نفس القيم إلى Vercel. |

---

## 2. ربط الريبو بـ GitHub

1. ارفع آخر التعديلات إلى GitHub:
   ```bash
   git add .
   git commit -m "جاهز للنشر على Vercel"
   git push origin main
   ```
2. تأكد أن الريبو يظهر على:  
   `https://github.com/cro0om3/ALMASAR-ALZAKI`  
   وأن الفرع الافتراضي للنشر هو `main` (أو `master` حسب إعداداتك).

---

## 3. إنشاء مشروع على Vercel وربطه بالريبو

### الطريقة الأولى: من لوحة Vercel (مُفضّلة)

1. ادخل إلى [vercel.com](https://vercel.com) وسجّل الدخول.
2. اضغط **Add New…** → **Project**.
3. اختر **Import Git Repository**.
4. إذا لم يكن GitHub مربوطاً، اضغط **Connect Git Provider** واختر **GitHub** واسمح لـ Vercel بالوصول إلى الريبوهات.
5. ابحث عن الريبو: **ALMASAR-ALZAKI** (أو `cro0om3/ALMASAR-ALZAKI`) واضغط **Import**.
6. في شاشة إعداد المشروع:
   - **Project Name:** يمكن تركه كما هو (مثلاً `almasar-alzaki`) أو تغييره إلى `uncle-website-system`.
   - **Framework Preset:** يجب أن يظهر **Next.js** تلقائياً.
   - **Root Directory:** اتركه فارغاً إن كان المشروع في جذر الريبو.
   - **Build Command:** اترك الافتراضي أو تأكد أنه يستخدم أمر البناء الصحيح (راجع القسم 7).
7. **لا تضغط Deploy بعد.** انتقل أولاً إلى إضافة متغيرات البيئة (القسم 4).

### الطريقة الثانية: من Vercel CLI

1. ثبّت Vercel CLI إن لم يكن مثبتاً:
   ```bash
   npm i -g vercel
   ```
2. من جذر المشروع:
   ```bash
   vercel login
   vercel
   ```
3. اتبع الأسئلة: ربط المشروع بحسابك، اختيار الريبو إن طُلب منك، ثم إضافة المتغيرات من لوحة Vercel كما في القسم 4.

---

## 4. إضافة متغيرات البيئة

بدون متغيرات البيئة الصحيحة، التطبيق على Vercel **لن يتصل بـ Supabase** وسيفشل تسجيل الدخول وكل العمليات التي تحتاج قاعدة البيانات.

### من لوحة Vercel

1. من صفحة المشروع على Vercel: **Settings** → **Environment Variables**.
2. أضف المتغيرات التالية (للبيئات **Production** و **Preview** و **Development** إن أردت):

| الاسم | القيمة | مطلوب |
|------|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | عنوان مشروع Supabase، مثل `https://xxxxx.supabase.co` | نعم |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | المفتاح العام (Anon/Public) من Supabase | نعم |
| `SUPABASE_SERVICE_ROLE_KEY` | مفتاح Service Role من Supabase (لعمليات السيرفر والـ API) | نعم |
| `DATABASE_URL` | رابط اتصال Postgres إن كان البناء أو أي سكربت يحتاجه، بصيغة:  
  `postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require` | حسب الاستخدام |

3. انسخ القيم من ملف `.env.local` أو `.env` الذي يعمل عليه المشروع محلياً — **لا تضع التوكنز أو المفاتيح في Git أو في محادثات.**
4. بعد إضافة كل المتغيرات، احفظ (Save).

### إضافة المتغيرات عبر سكربت (اختياري)

إذا أردت إضافة المتغيرات من جهازك دون إدخالها يدوياً في الموقع:

1. انسخ الملف النموذجي:
   ```bash
   cp .env.vercel.example .env.vercel
   ```
2. افتح `.env.vercel` وعبّئ:
   - `VERCEL_TOKEN`: من [Vercel → Settings → Tokens](https://vercel.com/account/tokens) (أنشئ توكن جديد).
   - `VERCEL_PROJECT_NAME`: اسم المشروع على Vercel.
   - `VERCEL_TEAM_ID`: إن كان المشروع تحت Team (من إعدادات الفريق).
   - نفس قيم Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
3. شغّل السكربت:
   ```bash
   node scripts/vercel-add-env.js
   ```
   (ملف `.env.vercel` مُدرج في `.gitignore` ولا يُرفع مع المشروع.)

---

## 5. أول نشر (Deploy)

1. بعد ربط الريبو وإضافة متغيرات البيئة، من صفحة المشروع على Vercel اضغط **Deploy**.
2. أو من تبويب **Deployments** اضغط **Redeploy** لأحدث commit.
3. انتظر حتى ينتهي البناء (Build). يمكنك متابعة الـ Logs من نفس الصفحة.
4. عند النجاح ستظهر لك رابط مثل:  
   `https://uncle-website-system.vercel.app`  
   (أو الاسم الذي اخترته للمشروع).

جرّب فتح الرابط وتسجيل الدخول والتأكد من تحميل البيانات من Supabase.

---

## 6. النشرات التالية

بعد ربط المشروع بـ GitHub:

- كل **Push** إلى الفرع المربوط (مثلاً `main`) يفعّل **نشر تلقائي** على Vercel.
- لا تحتاج تشغيل أوامر إضافية من جهازك للنشر؛ فقط:
  ```bash
  git add .
  git commit -m "وصف التعديل"
  git push origin main
  ```
- يمكنك متابعة حالة كل نشر من **Vercel → المشروع → Deployments**.

---

## 7. إعدادات البناء في المشروع

المشروع يحتوي على إعدادات جاهزة لـ Vercel:

### ملف `vercel.json`

```json
{
  "buildCommand": "npm run vercel-build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["dub1"]
}
```

- **buildCommand:** يستخدم `vercel-build` (راجع `package.json`).
- **regions:** `dub1` = منطقة دبي (أقرب للمستخدمين في الخليج).

### في `package.json`

- **vercel-build:**  
  `prisma generate && next build`  
  يضمن توليد عميل Prisma ثم بناء Next.js.

لا تحتاج عادةً لتغيير هذه الإعدادات إلا إذا أضفت خطوات بناء خاصة بك.

---

## 8. دومين مخصص (اختياري)

1. من المشروع على Vercel: **Settings** → **Domains**.
2. اضغط **Add** وأدخل الدومين (مثل `app.example.com`).
3. اتبع تعليمات Vercel لإضافة السجلات (Records) في لوحة تحكم الدومين (DNS).
4. بعد التحقق، Vercel يفعّل SSL تلقائياً للدومين.

---

## 9. استكشاف الأخطاء

| المشكلة | ماذا تفعل |
|---------|-----------|
| **البناء يفشل (Build Failed)** | راجع **Deployments** → آخر نشر → **Building** واقرأ سطر الخطأ. غالباً: خطأ في TypeScript/ESLint، أو حزمة ناقصة، أو أمر بناء خاطئ. |
| **صفحة 500 أو خطأ عند فتح الموقع** | تأكد من إضافة كل متغيرات البيئة (Supabase URL + Anon Key + Service Role Key) وقيمها صحيحة. |
| **تسجيل الدخول لا يعمل** | تأكد أن `NEXT_PUBLIC_SUPABASE_URL` و `NEXT_PUBLIC_SUPABASE_ANON_KEY` مضبوطان وأن Supabase Auth مفعّل للمشروع. |
| **البيانات لا تظهر** | تأكد أن `SUPABASE_SERVICE_ROLE_KEY` مضبوط وأن الجداول والـ RLS في Supabase تسمح بالوصول كما في البيئة المحلية. |
| **التغييرات لا تظهر بعد Push** | تأكد أنك دفعت إلى الفرع المربوط (مثلاً `main`) وانتظر انتهاء النشر من تبويب Deployments. |

للتفاصيل عن **كيف يعمل الربط بين الوثائق (Quotation → PO → Invoice → Receipt)** على Vercel ونفس قاعدة Supabase، راجع الملف:  
**[VERCEL_DEPLOYMENT_AND_LINKING.md](./VERCEL_DEPLOYMENT_AND_LINKING.md)**.

---

## ملخص سريع

1. ارفع الكود إلى GitHub وادخل إلى Vercel.
2. **Add New Project** → Import من GitHub → اختر **ALMASAR-ALZAKI**.
3. أضف متغيرات البيئة (Supabase URL + Anon Key + Service Role Key).
4. اضغط **Deploy**.
5. كل **Push** لاحق إلى `main` ينشر تلقائياً.

بعد ذلك الموقع يعمل على رابط Vercel مع نفس قاعدة Supabase والربط بين الوثائق كما يعمل محلياً.
