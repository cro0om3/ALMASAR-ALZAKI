# 🔐 تعليمات إعداد Supabase Authentication

## ✅ تم إضافة OAuth Authentication بنجاح!

---

## 📋 ما تم إضافته:

### 1. ✅ Supabase Client
- `lib/supabase.ts` - Client-side Supabase
- `lib/supabase-server.ts` - Server-side Supabase

### 2. ✅ Authentication
- `contexts/AuthContext.tsx` - إدارة تسجيل الدخول
- `components/auth/LoginForm.tsx` - نموذج تسجيل الدخول
- `app/login/page.tsx` - صفحة تسجيل الدخول
- `app/auth/callback/route.ts` - معالج OAuth callback

### 3. ✅ الحماية
- `middleware.ts` - حماية الصفحات (يحتاج تسجيل دخول)

### 4. ✅ Real-time
- `lib/hooks/use-realtime.ts` - Real-time subscriptions

### 5. ✅ Database Functions
- `supabase-functions.sql` - حساب تلقائي للمجموع

---

## 🚀 الخطوات التالية:

### 1. إعداد Google OAuth في Supabase

1. اذهب إلى: **https://supabase.com/dashboard/project/tundlptcusiogiaagsba**
2. **Settings** → **Authentication** → **Providers**
3. اضغط على **Google**
4. فعّل **Enable Google provider**
5. أضف:
   - **Client ID** (من Google Cloud Console)
   - **Client Secret** (من Google Cloud Console)
6. اضغط **Save**

### 2. إعداد Google Cloud Console

1. اذهب إلى: **https://console.cloud.google.com**
2. أنشئ مشروع جديد (أو استخدم موجود)
3. **APIs & Services** → **Credentials**
4. **Create Credentials** → **OAuth 2.0 Client ID**
5. **Application type**: Web application
6. **Authorized redirect URIs**: 
   ```
   https://tundlptcusiogiaagsba.supabase.co/auth/v1/callback
   ```
7. انسخ **Client ID** و **Client Secret**
8. أضفهم في Supabase (الخطوة 1)

### 3. إضافة Environment Variables في Vercel

في Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://tundlptcusiogiaagsba.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_l-7BTT9CzD5fkuKxGpOfMg_nsz72V-Q
SUPABASE_SERVICE_ROLE_KEY=sb_secret_8hIdHJTfUdAwUTyHjHaAIw_j0VDaTmx
```

### 4. تشغيل Database Functions

1. اذهب إلى: **https://supabase.com/dashboard/project/tundlptcusiogiaagsba/sql**
2. انسخ محتوى `supabase-functions.sql`
3. الصق في SQL Editor
4. اضغط **RUN**

---

## 🎯 كيف يعمل:

### تسجيل الدخول:
1. المستخدم يضغط "تسجيل الدخول بـ Google"
2. يتم توجيهه إلى Google
3. بعد الموافقة → يعود للموقع
4. `middleware.ts` يتحقق من الجلسة
5. إذا مسجل دخول → يرى الموقع
6. إذا لا → يوجه إلى `/login`

### Real-time:
- عند إنشاء/تعديل فاتورة → تحديث فوري للجميع
- استخدم `useRealtime` hook في المكونات

### Database Functions:
- حساب `total` تلقائياً في الفواتير
- تحديث `updatedAt` تلقائياً

---

## ✅ Checklist:

- [ ] أضفت Google OAuth في Supabase
- [ ] أضفت Environment Variables في Vercel
- [ ] شغّلت `supabase-functions.sql`
- [ ] اختبرت تسجيل الدخول

---

**🎉 كل شيء جاهز! الآن الموقع محمي بتسجيل دخول!**
