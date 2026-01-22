# 🔐 معلومات Supabase Project

## 📋 معلومات المشروع

**Project URL**: https://tundlptcusiogiaagsba.supabase.co  
**Dashboard**: https://supabase.com/dashboard/project/tundlptcusiogiaagsba

---

## 🔑 API Keys

### Public/Anon Key (للـ Frontend)
```
sb_publishable_l-7BTT9CzD5fkuKxGpOfMg_nsz72V-Q
```
✅ **آمن للاستخدام في Client-side**

### Secret Key (للـ Backend فقط)
```
sb_secret_8hIdHJTfUdAwUTyHjHaAIw_j0VDaTmx
```
⚠️ **استخدمه فقط في Server-side - لا تشاركه أبداً!**

---

## 🔗 Connection String

### ✅ Connection String الكامل:

```
postgresql://postgres:Fhd%402992692Fhd@db.tundlptcusiogiaagsba.supabase.co:5432/postgres
```

⚠️ **ملاحظة:** تم ترميز الرمز `@` إلى `%40` في كلمة المرور (URL encoding)

### للتحقق من Connection String:
يمكنك الحصول عليه أيضاً من:
- **Supabase Dashboard** → **Settings** → **Database** → **Connection String**

---

## 📝 Environment Variables المطلوبة

### في Vercel:

#### 1. DATABASE_URL (مطلوب) ⭐
```
postgresql://postgres:Fhd%402992692Fhd@db.tundlptcusiogiaagsba.supabase.co:5432/postgres
```

⚠️ **ملاحظة:** تم ترميز الرمز `@` في كلمة المرور إلى `%40`

#### 2. Supabase API Keys (اختياري - للاستخدام المستقبلي)

**NEXT_PUBLIC_SUPABASE_URL:**
```
https://tundlptcusiogiaagsba.supabase.co
```

**NEXT_PUBLIC_SUPABASE_ANON_KEY:**
```
sb_publishable_l-7BTT9CzD5fkuKxGpOfMg_nsz72V-Q
```

**SUPABASE_SERVICE_ROLE_KEY:**
```
sb_secret_8hIdHJTfUdAwUTyHjHaAIw_j0VDaTmx
```

---

## 🗄️ إنشاء الجداول

### الطريقة السريعة:

1. اذهب إلى: **https://supabase.com/dashboard/project/tundlptcusiogiaagsba/sql**
2. انسخ محتوى ملف `supabase-schema.sql`
3. الصق في SQL Editor
4. اضغط **RUN**

---

## ✅ الخطوات التالية

1. ✅ **Connection String جاهز!** (تم الحصول عليه)
2. ⏭️ أضف **DATABASE_URL** في Vercel Environment Variables
3. ⏭️ أنشئ الجداول من SQL Editor
4. ⏭️ اختبر قاعدة البيانات

---

## 📚 للمزيد من التفاصيل

راجع ملف `خطوات_بعد_إنشاء_Supabase.md` للدليل الكامل.
