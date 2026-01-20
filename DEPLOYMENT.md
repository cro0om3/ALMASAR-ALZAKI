# دليل رفع التطبيق على Vercel 🚀

## الخطوات الأساسية

### 1. إعداد Git Repository

```bash
# تأكد من أن المشروع على GitHub/GitLab/Bitbucket
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### 2. إنشاء حساب على Vercel

1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل دخول بحساب GitHub/GitLab/Bitbucket
3. اضغط على "Add New Project"
4. اختر المشروع من قائمة Repositories

### 3. إعداد قاعدة البيانات

#### الخيار 1: Vercel Postgres (موصى به) ⭐

**الأفضل للتكامل مع Vercel**

1. في Vercel Dashboard، اذهب إلى **Storage** → **Create Database**
2. اختر **Postgres**
3. اختر الخطة (Free tier متاح)
4. انسخ `DATABASE_URL` من Settings
5. أضفها كـ Environment Variable في Vercel

**المميزات:**
- ✅ تكامل مباشر مع Vercel
- ✅ مجاني للبداية
- ✅ سريع وموثوق
- ✅ نسخ احتياطي تلقائي

#### الخيار 2: Supabase (مجاني وممتاز)

1. اذهب إلى [supabase.com](https://supabase.com)
2. أنشئ حساب جديد
3. أنشئ مشروع جديد
4. اذهب إلى **Settings** → **Database**
5. انسخ **Connection String** (URI)
6. أضفها كـ `DATABASE_URL` في Vercel Environment Variables

**المميزات:**
- ✅ 500MB مجاني
- ✅ واجهة إدارة ممتازة
- ✅ Real-time features
- ✅ Authentication مدمج

#### الخيار 3: PlanetScale (MySQL)

1. اذهب إلى [planetscale.com](https://planetscale.com)
2. أنشئ حساب جديد
3. أنشئ Database جديد
4. انسخ Connection String
5. أضفها كـ `DATABASE_URL` في Vercel

**ملاحظة:** تحتاج لتعديل Prisma schema لاستخدام MySQL بدلاً من PostgreSQL

### 4. إعداد Environment Variables في Vercel

في Vercel Project Settings → Environment Variables، أضف:

```
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-... (اختياري)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

### 5. إعداد Prisma

#### أ. تحديث Prisma Schema (إذا لزم الأمر)

```prisma
datasource db {
  provider = "postgresql"  // أو "mysql" لـ PlanetScale
  url      = env("DATABASE_URL")
}
```

#### ب. إعداد Build Command في Vercel

في Vercel Project Settings → General → Build & Development Settings:

**Build Command:**
```bash
npx prisma generate && npm run build
```

**Install Command:**
```bash
npm install
```

### 6. تشغيل Migrations

#### قبل الرفع (محلياً):

```bash
# توليد Prisma Client
npx prisma generate

# إنشاء Migration
npx prisma migrate dev --name init

# أو Push مباشرة (للتطوير)
npx prisma db push
```

#### على Vercel (بعد الرفع):

يمكنك إضافة Post-Deploy Script في `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

أو استخدام Vercel CLI:

```bash
vercel env pull .env.local
npx prisma migrate deploy
```

### 7. رفع المشروع

#### الطريقة 1: من Vercel Dashboard

1. اذهب إلى Vercel Dashboard
2. اضغط **Add New Project**
3. اختر Repository
4. Vercel سيكتشف Next.js تلقائياً
5. أضف Environment Variables
6. اضغط **Deploy**

#### الطريقة 2: من Terminal (Vercel CLI)

```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# رفع المشروع
vercel

# للرفع على Production
vercel --prod
```

### 8. إعداد Custom Domain (اختياري)

1. في Vercel Project → Settings → Domains
2. أضف Domain الخاص بك
3. اتبع التعليمات لإعداد DNS

## 🔧 إعدادات إضافية

### تحديث next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // للأداء الأفضل على Vercel
  // ... باقي الإعدادات
}
```

### إضافة vercel.json (موجود بالفعل)

```json
{
  "buildCommand": "npx prisma generate && npm run build",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

## 📊 مراقبة التطبيق

### Vercel Analytics

1. في Project Settings → Analytics
2. فعّل Vercel Analytics
3. راقب الأداء والاستخدام

### Logs

- في Vercel Dashboard → Deployments
- اضغط على أي Deployment
- شاهد Logs في الوقت الفعلي

## 🐛 حل المشاكل الشائعة

### خطأ: "Prisma Client not generated"

**الحل:**
```bash
# أضف في package.json
"postinstall": "prisma generate"
```

### خطأ: "Database connection failed"

**الحل:**
- تأكد من `DATABASE_URL` صحيح
- تأكد من أن Database يسمح بالاتصالات من Vercel IPs
- استخدم SSL في Connection String

### خطأ: "Module not found"

**الحل:**
- تأكد من أن جميع dependencies في `package.json`
- شغّل `npm install` محلياً للتأكد

## 📝 Checklist قبل الرفع

- [ ] جميع Environment Variables محددة
- [ ] Prisma Schema محدث
- [ ] `DATABASE_URL` صحيح
- [ ] تم تشغيل `prisma generate` محلياً
- [ ] تم اختبار Build محلياً (`npm run build`)
- [ ] `.env` في `.gitignore`
- [ ] جميع الملفات المهمة موجودة
- [ ] تم اختبار التطبيق محلياً

## 🎯 بعد الرفع

1. ✅ اختبر جميع الصفحات
2. ✅ تأكد من اتصال قاعدة البيانات
3. ✅ اختبر إنشاء/تعديل/حذف البيانات
4. ✅ راقب Logs للأخطاء
5. ✅ فعّل Analytics للمراقبة

## 💡 نصائح

- استخدم **Vercel Postgres** للأسهل والأسرع
- فعّل **Automatic Deployments** من Git
- استخدم **Preview Deployments** للاختبار قبل Production
- راقب **Usage** لتجنب تجاوز الحدود المجانية

## 📞 الدعم

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**ملاحظة:** التطبيق حالياً يستخدم `localStorage` للبيانات. بعد رفع قاعدة البيانات، ستحتاج لتحديث Services لاستخدام Prisma بدلاً من localStorage.
