# Maser-AlZaki Subabase

| الحقل | القيمة |
|-------|--------|
| Project name | Maser-AlZaki |
| Project ID | ebelbztbpzccdhytynnc |
| Project URL | https://ebelbztbpzccdhytynnc.supabase.co |
| API (anon public) | sb_publishable_hDEEzbaiJX0-4cdeE4BVbQ_8WqAAbs5 |
| Secret keys (service_role) | sb_secret_t0LnDUHEPTMSNez6PyLlqg_udKq1Zmq |
| JWT Keys Current key | 7470e867-377c-4122-b35e-f7fad6634907 |
| JWT Keys Previous key | 200aa614-5260-4fdf-849e-6e80005359a9 |
| Access Tokens | sbp_ef579d7bd307bdf6a631d162d47dda15666c6bbc |
| Password | [لا تضع كلمة السر هنا — احفظها في مكان آمن فقط] |

---

## استخدام القيم في Vercel (Environment Variables)

| متغير البيئة في Vercel | انسخ من الصف |
|------------------------|---------------|
| NEXT_PUBLIC_SUPABASE_URL | Project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | API (anon public) |
| SUPABASE_SERVICE_ROLE_KEY | Secret keys (service_role) |
| DATABASE_URL | `postgresql://postgres:[Password]@db.ebelbztbpzccdhytynnc.supabase.co:5432/postgres?sslmode=require` (استبدل [Password] بكلمة سر قاعدة البيانات) |

**تحذير:** لا ترفع هذا الملف إلى Git إذا وضعت فيه كلمات سر حقيقية. أضف `docs/SUPABASE_CREDENTIALS_TABLE.md` إلى `.gitignore` إن أردت تخزين قيم حقيقية فيه محلياً فقط.
