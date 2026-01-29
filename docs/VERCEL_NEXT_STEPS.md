# خطوات إكمال النشر على Vercel

تم تنفيذ التالي:

1. **رفع الكود إلى GitHub** — تم بنجاح (`git push origin main`).
2. **محاولة النشر من الطرفية** — فشلت لأن التوكن في `.env.vercel` غير صالح.
3. **تجربة محلية** — تم تسجيل الدخول (PIN: 1234) وفتح صفحة إنشاء فاتورة وملء الحقول والضغط على "إنشاء الفاتورة".

---

## لإكمال النشر على Vercel

### الخيار 1: ربط الريبو من لوحة Vercel (مُفضّل)

1. ادخل إلى [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. اختر **Import** من GitHub واختر الريبو: **cro0om3/ALMASAR-ALZAKI**.
3. تأكد من إضافة **متغيرات البيئة** (Supabase URL + Anon Key + Service Role Key) في إعدادات المشروع.
4. اضغط **Deploy**.  
   بعد الربط، كل **Push** إلى `main` سينشر تلقائياً.

### الخيار 2: النشر من الطرفية بعد تصحيح التوكن

1. أنشئ توكن جديد من [Vercel → Settings → Tokens](https://vercel.com/account/tokens).
2. ضعه في ملف `.env.vercel` تحت المفتاح `VERCEL_TOKEN`.
3. من جذر المشروع شغّل:
   ```bash
   node scripts/vercel-deploy.js
   ```

---

## رابط المشروع على GitHub

**https://github.com/cro0om3/ALMASAR-ALZAKI**

بعد ربط هذا الريبو بمشروع Vercel وإضافة متغيرات البيئة، النشر سيعمل من أول Deploy.
