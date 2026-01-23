# 🔐 إضافة Environment Variables إلى Vercel عبر API

## ✅ طريقة سريعة لإضافة Environment Variables

### 📋 المتطلبات:

1. **Vercel API Token**
   - اذهب إلى: **https://vercel.com/account/tokens**
   - اضغط **Create Token**
   - انسخ الـ Token

2. **Project ID**
   - Project ID: `prj_vYVJ3thAnk1Z78QK6vmrKfD2rY7k`

---

## 🚀 خطوات الإضافة:

### 1. احصل على Vercel API Token

1. اذهب إلى: **https://vercel.com/account/tokens**
2. اضغط **Create Token**
3. أعطِه اسم (مثلاً: `add-env-vars`)
4. انسخ الـ Token

### 2. أضف Token إلى Environment

#### Windows (PowerShell):
```powershell
$env:VERCEL_TOKEN="your_token_here"
```

#### Windows (CMD):
```cmd
set VERCEL_TOKEN=your_token_here
```

#### أو أضفه إلى `.env.local`:
```
VERCEL_TOKEN=your_token_here
```

### 3. شغّل السكريبت

```bash
node add-vercel-env-via-api.js
```

---

## 📝 ما سيتم إضافته:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://postgres:Fhd%23%232992692@db.tundlptcusiogiaagsba.supabase.co:5432/postgres?sslmode=require` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://tundlptcusiogiaagsba.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_l-7BTT9CzD5fkuKxGpOfMg_nsz72V-Q` |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_8hIdHJTfUdAwUTyHjHaAIw_j0VDaTmx` |

---

## ✅ بعد الإضافة:

1. **تحقق من Vercel Dashboard:**
   - اذهب إلى Project → Settings → Environment Variables
   - تأكد من أن جميع المتغيرات موجودة

2. **Redeploy المشروع:**
   - اذهب إلى Deployments
   - اضغط Redeploy

---

## 🆘 إذا واجهت مشكلة:

### المشكلة: "VERCEL_TOKEN is not set"
**الحل:**
```bash
# Windows PowerShell
$env:VERCEL_TOKEN="your_token_here"

# Windows CMD
set VERCEL_TOKEN=your_token_here

# ثم شغّل السكريبت
node add-vercel-env-via-api.js
```

### المشكلة: "Unauthorized"
**الحل:**
- تأكد من أن الـ Token صحيح
- تأكد من أن الـ Token له صلاحيات كافية

### المشكلة: "Project not found"
**الحل:**
- تأكد من Project ID: `prj_vYVJ3thAnk1Z78QK6vmrKfD2rY7k`
- تأكد من أن المشروع موجود في حسابك

---

## 🎯 النتيجة:

بعد تشغيل السكريبت:
- ✅ جميع Environment Variables ستُضاف تلقائياً
- ✅ ستكون متاحة لجميع Environments (Production, Preview, Development)
- ✅ يمكنك Redeploy المشروع مباشرة

---

**💡 نصيحة:** احفظ Vercel API Token في مكان آمن - ستحتاجه للمستقبل!
