# دليل الرفع والنشر — خطوة بخطوة

## 1. رفع المشروع على GitHub

1. أنشئ مستودعاً جديداً على [GitHub](https://github.com/new) (مثلاً `ALMASAR-ALZAKI` أو أي اسم تفضّله).
2. من جذر المشروع على جهازك نفّذ:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git push -u origin main
```

استبدل `USERNAME` و `REPO_NAME` باسم المستخدم واسم المستودع.

---

## 2. ربط المشروع بـ Vercel

1. ادخل إلى [vercel.com](https://vercel.com) وسجّل الدخول.
2. **Add New Project** → **Import Git Repository**.
3. اختر المستودع: **cro0om3/ALMASAR-ALZAKI**.
4. اترك الإعدادات الافتراضية (Framework: Next.js يكتشف تلقائياً).
5. **قبل الضغط على Deploy:** اضغط **Environment Variables** وأضف المتغيرات الأربعة (انظر القسم التالي)، ثم **Deploy**.

---

## 3. إضافة متغيرات البيئة على Vercel

1. من لوحة Vercel: **المشروع** → **Settings** → **Environment Variables**.
2. أضف المتغيرات التالية (القيم من Supabase):

| الاسم | القيمة | ملاحظة |
|-------|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | من Supabase → Settings → API → Project URL | مطلوب |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | من Supabase → Settings → API → anon public | مطلوب |
| `SUPABASE_SERVICE_ROLE_KEY` | من Supabase → Settings → API → service_role | مطلوب للـ API |
| `DATABASE_URL` | من Supabase → Settings → Database → Connection string (URI) | إن كان البناء يحتاجه |

3. احفظ ثم من تبويب **Deployments** اختر **Redeploy** لأحدث نشر.

---

## 4. إنشاء مستخدم دخول (Admin) في Supabase

بعد النشر، لتسجيل الدخول بالموقع تحتاج مستخدماً في جدول `users` في Supabase.

من جذر المشروع (بعد تعبئة `.env.local` بنفس قيم Supabase):

```bash
node scripts/create-admin-user-supabase.js
```

هذا ينشئ مستخدماً برقم PIN `1234` (أو يحدّثه). لإنشاء ثلاثة مستخدمين (admin، user، manager):

```bash
node scripts/create-three-users-supabase.js
```

---

## 5. التأكد من البناء والنشر

- **محلياً:** `npm run build` ثم `npm start` للتأكد أن المشروع يبني بدون أخطاء.
- **على Vercel:** بعد إضافة المتغيرات وإعادة النشر، افتح رابط المشروع (مثل `https://your-app.vercel.app`) وجرّب تسجيل الدخول.

---

## 6. إذا ظهر خطأ "spawn sh ENOENT" أثناء البناء

المشروع معدّ مسبقاً لتقليل هذا الخطأ:

- **`.npmrc`** يحتوي `ignore-scripts=true`.
- **`vercel.json`** يستخدم `installCommand: "npm install --ignore-scripts"` و `buildCommand: "npm run vercel-build"`.

تأكد أن آخر التعديلات (بما فيها `.npmrc` و `vercel.json`) مرفوعة على GitHub ثم أعد النشر. إن استمر الخطأ، جرّب تغيير منطقة البناء من إعدادات Vercel أو تواصل مع دعم Vercel.

---

## وثائق إضافية

- **`docs/VERCEL_DEPLOYMENT_AND_LINKING.md`** — شرح تقني للربط بين الوثائق (كوتيشن، أوامر شراء، فواتير، إيصالات) ومتغيرات البيئة.
- **`docs/SUPABASE_CREDENTIALS_TABLE.md`** — مكان الحصول على مفاتيح Supabase.
