# 🚀 تشغيل Migrations الآن

## ✅ تم ربط قاعدة البيانات في Vercel!

الآن يجب تشغيل Migrations لإنشاء الجداول.

---

## 📋 الخطوات:

### الخطوة 1: سحب Environment Variables من Vercel

#### إذا لم يكن Vercel CLI مثبت:

```bash
npm install -g vercel
vercel login
```

#### سحب Environment Variables:

```bash
vercel env pull .env.local
```

هذا سينشئ ملف `.env.local` مع `DATABASE_URL` من Vercel.

---

### الخطوة 2: تشغيل Migrations

```bash
npx prisma db push
```

هذا سينشئ جميع الجداول تلقائياً في قاعدة البيانات.

---

### الخطوة 3: التحقق من نجاح العملية

بعد تشغيل `prisma db push`، يجب أن ترى:

```
✔ Your database is now in sync with your Prisma schema.
```

---

### الخطوة 4: اختبار قاعدة البيانات

1. اذهب إلى: **https://almasar-alzaki.vercel.app/api/test-db**
2. يجب أن ترى:
   ```json
   {
     "success": true,
     "message": "Database connection successful!",
     "data": {
       "customers": 0,
       "quotations": 0,
       "invoices": 0
     }
   }
   ```

---

## 🐛 إذا واجهت مشاكل:

### المشكلة: "vercel: command not found"
**الحل:**
```bash
npm install -g vercel
```

### المشكلة: "Environment variable DATABASE_URL not found"
**الحل:**
- تأكد من أنك ربطت قاعدة البيانات في Vercel
- شغّل `vercel env pull .env.local` مرة أخرى

### المشكلة: "Cannot connect to database"
**الحل:**
- تأكد من أن `DATABASE_URL` صحيح في `.env.local`
- تأكد من أن قاعدة البيانات نشطة في Neon

---

## ✅ بعد اكتمال Migrations:

1. ✅ الجداول تم إنشاؤها تلقائياً
2. ✅ قاعدة البيانات جاهزة للاستخدام
3. ✅ يمكنك الآن إنشاء Customers, Quotations, Invoices

---

## 🎉 جاهز!

التطبيق الآن متصل بقاعدة البيانات وجاهز للاستخدام! 🚀
