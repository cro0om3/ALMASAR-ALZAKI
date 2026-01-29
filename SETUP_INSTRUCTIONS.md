# تعليمات إعداد Supabase

## ✅ ما تم إنجازه

1. ✅ تم تحديث `.env.example` مع Supabase credentials الجديدة
2. ✅ تم إنشاء `scripts/setup-supabase-connection.js` لإعداد الاتصال
3. ✅ تم تحديث `supabase-schema.sql` مع تعطيل RLS
4. ✅ تم إنشاء `scripts/setup-supabase-schema.js` لتنفيذ Schema
5. ✅ تم تحديث `.env.local` مع Supabase credentials

## 📋 الخطوات المتبقية

### الخطوة 1: إنشاء Schema في Supabase

**الطريقة 1: استخدام Supabase SQL Editor (موصى بها)**

1. اذهب إلى: https://supabase.com/dashboard/project/ebelbztbpzccdhytynnc
2. اذهب إلى: SQL Editor
3. انسخ محتوى `supabase-schema.sql`
4. الصق في SQL Editor
5. اضغط "Run"

**الطريقة 2: استخدام Prisma (إذا كان الاتصال يعمل)**

```bash
npm run db:push
```

### الخطوة 2: إنشاء مستخدم Admin

**الطريقة 1: استخدام Supabase SQL Editor (موصى بها)**

1. اذهب إلى: SQL Editor في Supabase
2. انسخ محتوى `scripts/create-admin-user-direct.sql`
3. الصق في SQL Editor
4. اضغط "Run"

**الطريقة 2: استخدام Node.js Script (إذا كان الاتصال يعمل)**

```bash
npm run db:create-admin
```

### الخطوة 3: اختبار الاتصال

```bash
npm run db:test
```

### الخطوة 4: اختبار تسجيل الدخول

1. شغّل المشروع: `npm run dev`
2. اذهب إلى: http://localhost:3000/login
3. أدخل PIN Code: `1234`
4. يجب أن يعمل تسجيل الدخول بنجاح

## 🔧 معلومات Supabase

- **Project ID**: ebelbztbpzccdhytynnc
- **URL**: https://ebelbztbpzccdhytynnc.supabase.co
- **Publishable Key**: sb_publishable_hDEEzbaiJX0-4cdeE4BVbQ_8WqAAbs5
- **Secret Key**: sb_secret_t0LnDUHEpTMSNez6PyLIqg_udKq1Zmq
- **Database Password**: arjW2j8nDyEdWoPq

## ⚠️ ملاحظات مهمة

1. **RLS معطّل**: الكل يشوف كل شيء (شركة واحدة)
2. **PIN Code فقط**: تسجيل الدخول بـ PIN Code 1234 فقط (لا email/username)
3. **DATABASE_URL**: موجود في `.env.local` - إذا كان الاتصال لا يعمل، تحقق من كلمة المرور

## 🐛 Troubleshooting

### مشكلة: "Authentication failed"

**الحل:**
1. تحقق من كلمة مرور قاعدة البيانات في Supabase Dashboard
2. تأكد من أن DATABASE_URL صحيح في `.env.local`
3. جرب استخدام Direct Connection بدلاً من Pooling

### مشكلة: "Can't reach database server"

**الحل:**
1. تحقق من اتصال الإنترنت
2. تحقق من أن Supabase Project نشط
3. تحقق من Firewall/Network settings

### مشكلة: Schema لا يعمل

**الحل:**
1. استخدم Supabase SQL Editor مباشرة
2. انسخ `supabase-schema.sql` والصقه في SQL Editor
3. شغّل الأوامر واحداً تلو الآخر إذا فشل

## 📝 الملفات المهمة

- `supabase-schema.sql` - Schema كامل للجداول
- `scripts/create-admin-user-direct.sql` - SQL لإنشاء Admin User
- `.env.local` - Environment Variables (يحتوي على DATABASE_URL)
- `scripts/setup-supabase-connection.js` - Script لإعداد الاتصال
