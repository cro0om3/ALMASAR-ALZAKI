# حل خطأ: Invalid API key (Supabase)

الرسالة:
```
Error fetching settings: {
  message: 'Invalid API key',
  hint: 'Double check the provided API key for typos. This API key might also be owned by another Supabase project.'
}
```

## السبب
مفتاح Supabase المضبوط في **Vercel → Environment Variables** غير صحيح أو لا يطابق مشروع Supabase (الـ URL والمفتاح يجب أن يكونا من **نفس المشروع**).

---

## المطلوب (خطوة بخطوة)

### 1. أخذ القيم الصحيحة من Supabase
1. ادخل إلى [Supabase Dashboard](https://supabase.com/dashboard).
2. اختر **المشروع** الذي تستخدمه للتطبيق.
3. من القائمة الجانبية: **Settings** (أيقونة الترس) → **API**.
4. انسخ **بالضبط**:
   - **Project URL** (مثل `https://xxxxx.supabase.co`)
   - **Project API keys**:
     - **anon** **public** → هذا للمتصفح والعميل
     - **service_role** **secret** → هذا للسيرفر (مثل جلب الإعدادات) — **لا تشاركه في الواجهة**

### 2. تعبئة المتغيرات في Vercel
1. ادخل إلى [Vercel](https://vercel.com) → مشروعك.
2. **Settings** → **Environment Variables**.
3. تأكد من وجود القيم التالية (للبيئة Production و/أو Preview حسب استخدامك):

| الاسم في Vercel | القيمة (من Supabase) |
|-----------------|----------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | **Project URL** من Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | مفتاح **anon public** |
| `SUPABASE_SERVICE_ROLE_KEY` | مفتاح **service_role** (السري) |

### 3. تنبيهات مهمة
- **لا مسافات زائدة** في بداية أو نهاية القيمة عند اللصق.
- **لا أسطر جديدة** داخل قيمة المفتاح.
- الـ **URL** والـ **المفاتيح** يجب أن يكونوا كلهم من **نفس المشروع** في Supabase (لو غيّرت المشروع، غيّر الثلاثة).
- بعد تعديل المتغيرات في Vercel: **Redeploy** (نشر من جديد) حتى تُحمَّل القيم الجديدة.

### 4. إعادة النشر
من Vercel → تبويب **Deployments** → الثلاث نقاط بجانب آخر نشر → **Redeploy**.

بعد ذلك جرّب التطبيق مرة أخرى؛ لو بقي الخطأ، راجع أنك نسخت المفتاح كاملاً من صفحة API في نفس مشروع Supabase.
