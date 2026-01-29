# متغيرات البيئة المطلوبة في Vercel

أضف المتغيرات التالية في **Vercel → المشروع → Settings → Environment Variables** (Production و Preview و Development).

| اسم المتغير | من أين تحصل على القيمة |
|-------------|-------------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → **Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → **anon public** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → **service_role** (Secret) |
| `DATABASE_URL` | Supabase → Settings → Database → **Connection string** (URI) — أو الصيغة: `postgresql://postgres:[كلمة_السر]@db.ebelbztbpzccdhytynnc.supabase.co:5432/postgres?sslmode=require` |

**ملاحظة:** القيم الجاهزة لمشروع Maser-AlZaki موجودة في الملف `env-for-vercel.txt` على جهازك (غير مرفوع على Git). استبدل `YOUR_DB_PASSWORD` في `DATABASE_URL` بكلمة سر قاعدة البيانات.
