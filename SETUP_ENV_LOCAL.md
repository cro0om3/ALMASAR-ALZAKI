# 🔧 إعداد ملف .env.local

## ✅ تم إعداد ملف .env.local.example

الآن أضف DATABASE_URL إلى ملف `.env.local`:

---

## 📝 الخطوات:

### 1. افتح ملف `.env.local`

إذا لم يكن موجوداً، أنشئه في مجلد المشروع.

### 2. أضف المحتوى التالي:

```env
# Next.js Environment Variables

# Node Environment
NODE_ENV=development

# Next.js Configuration
NEXT_OUTPUT_MODE=standalone

# Database Connection (Supabase)
DATABASE_URL=postgresql://postgres:Fhd%23%232992692@db.tundlptcusiogiaagsba.supabase.co:5432/postgres?sslmode=require
```

---

## ✅ بعد إضافة DATABASE_URL:

### اختبر الاتصال محلياً:

```bash
npm run db:test
```

يجب أن ترى:
```
✅ DATABASE_URL is set
✅ Database connection successful!
```

---

## 🔒 ملاحظة أمنية:

- ✅ ملف `.env.local` موجود في `.gitignore` - لن يتم رفعه إلى GitHub
- ✅ آمن لحفظ معلومات حساسة مثل DATABASE_URL
- ⚠️ لا ترفع `.env.local` إلى GitHub أبداً!

---

## 📋 Checklist:

- [ ] ملف `.env.local` موجود
- [ ] DATABASE_URL مضاف
- [ ] شغّلت `npm run db:test` ونجح الاختبار

---

**💡 نصيحة:** استخدم `.env.local.example` كمرجع (تم إنشاؤه في المشروع)
