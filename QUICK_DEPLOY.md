# دليل سريع للرفع على Vercel 🚀

## الخطوات السريعة (5 دقائق)

### 1️⃣ إعداد قاعدة البيانات

#### خيار 1: Vercel Postgres (الأسهل) ⭐
```
1. اذهب إلى vercel.com → Dashboard
2. Storage → Create Database → Postgres
3. انسخ DATABASE_URL
```

#### خيار 2: Supabase (مجاني)
```
1. اذهب إلى supabase.com
2. أنشئ مشروع جديد
3. Settings → Database → Connection String
4. انسخ DATABASE_URL
```

### 2️⃣ رفع المشروع على Vercel

#### من Vercel Dashboard:
```
1. اذهب إلى vercel.com
2. Add New Project
3. اختر Repository من GitHub
4. أضف Environment Variables:
   - DATABASE_URL (من الخطوة 1)
   - OPENAI_API_KEY (اختياري)
5. اضغط Deploy
```

#### أو من Terminal:
```bash
npm i -g vercel
vercel login
vercel --prod
```

### 3️⃣ إعداد قاعدة البيانات

بعد الرفع، شغّل Migrations:

```bash
# محلياً
npx prisma generate
npx prisma db push

# أو على Vercel (بعد الرفع)
vercel env pull .env.local
npx prisma migrate deploy
```

### 4️⃣ Environment Variables في Vercel

في Project Settings → Environment Variables:

```
DATABASE_URL = postgresql://...
OPENAI_API_KEY = sk-... (اختياري)
NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
```

## ✅ Checklist

- [ ] قاعدة بيانات جاهزة (Vercel Postgres أو Supabase)
- [ ] DATABASE_URL جاهز
- [ ] المشروع على GitHub
- [ ] Environment Variables محددة في Vercel
- [ ] تم تشغيل `prisma generate` محلياً
- [ ] تم Deploy على Vercel
- [ ] تم تشغيل Migrations

## 🎯 بعد الرفع

1. اختبر التطبيق على الرابط الجديد
2. تأكد من اتصال قاعدة البيانات
3. راقب Logs في Vercel Dashboard

## 📚 للمزيد من التفاصيل

راجع ملف `DEPLOYMENT.md` للدليل الكامل
