# متغيرات البيئة (Environment Variables)

انسخ الأسماء كما هي وضع القيم من مشروعك. **لا تضع المفاتيح الحقيقية في Git.**

---

## نسخ المتغيرات إلى Vercel من env-for-vercel.txt

في جذر المشروع يوجد ملف **`env-for-vercel.txt`** (غير مرفوع على Git) يحتوي القيم الجاهزة. لاستخدامها على Vercel:

1. افتح الملف **`env-for-vercel.txt`** من جذر المشروع.
2. ادخل إلى Vercel → مشروعك → **Settings** → **Environment Variables**.
3. أضف كل متغير على حدة: **Name** = الجزء قبل `=`، **Value** = الجزء بعد `=` (بدون مسافات زائدة في البداية أو النهاية).
4. احفظ ثم من **Deployments** اضغط **Redeploy** لأحدث نشر.

---

## بلوك جاهز للنسخ في Vercel (أضف القيم من Supabase)

في Vercel → **Settings** → **Environment Variables** أضف المتغيرات التالية، وعبّئ **Value** من Supabase (Settings → API و Database):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
```

- **NEXT_PUBLIC_SUPABASE_URL** = Project URL من Supabase (مثل `https://xxxxx.supabase.co`)
- **NEXT_PUBLIC_SUPABASE_ANON_KEY** = مفتاح anon public
- **SUPABASE_SERVICE_ROLE_KEY** = مفتاح service_role (سري)
- **DATABASE_URL** = Connection string لـ Postgres من Supabase (Settings → Database)

**مهم:** الثلاثة الأولى يجب أن يكونوا من **نفس المشروع** في Supabase. إذا Free Plan ممتلئ (2 مشاريع)، استخدم أحد المشروعين الحاليين أو ترقية الخطة.

---

## 1. Supabase (مطلوبة للتطبيق وواجهة الإعدادات)

| اسم المتغير | من أين تأخذ القيمة |
|-------------|---------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → مشروعك → **Settings** → **API** → **Project URL** (مثل `https://xxxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | نفس الصفحة → **Project API keys** → **anon** **public** |
| `SUPABASE_SERVICE_ROLE_KEY` | نفس الصفحة → **service_role** **secret** (لا تشاركه في الواجهة) |

**ملاحظة:** الثلاثة يجب أن يكونوا من **نفس المشروع** في Supabase. لو وصلت حد المشاريع المجانية (2)، استخدم أحد المشروعين الموجودين أو ترقية الخطة.

---

## 2. قاعدة البيانات (لـ Prisma إن استخدمته)

| اسم المتغير | من أين تأخذ القيمة |
|-------------|---------------------|
| `DATABASE_URL` | Supabase → **Settings** → **Database** → **Connection string** → **URI**، أو الصيغة: `postgresql://postgres:[YOUR_PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require` (استبدل `[YOUR_PASSWORD]` و `[PROJECT_REF]` بقيم مشروعك) |

---

## 3. اختيارية (محلي / سكربتات)

| اسم المتغير | الاستخدام |
|-------------|-----------|
| `NODE_ENV` | `development` أو `production` |
| `NEXT_OUTPUT_MODE` | مثلاً `standalone` للنشر |

---

## ملف محلي (لا يرفع على Git)

- انسخ `.env.example` إلى `.env.local`.
- عبّئ القيم من Supabase (ونفس المشروع للـ URL والأنون والـ service_role).
- للتطبيق المنشور على Vercel: نفس الأسماء والقيم في **Settings** → **Environment Variables** ثم إعادة النشر.
