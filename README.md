# ALMSAR ALZAKI Transport and Maintenance - CRM System

نظام إدارة علاقات العملاء (CRM) شامل لإدارة العروض، الفواتير، العملاء، المشاريع، الموظفين، المركبات، وأكثر.

## المميزات الرئيسية

### إدارة الطلبات
- **العروض (Quotations)** - إنشاء وإدارة عروض الأسعار
- **الفواتير (Invoices)** - إنشاء وتتبع الفواتير
- **أوامر الشراء (Purchase Orders)** - إدارة أوامر الشراء
- **الإيصالات (Receipts)** - نظام إيصالات الدفع

### الموارد البشرية
- **الموظفين (Employees)** - إدارة بيانات الموظفين
- **كشوف المرتبات (Payslips)** - إدارة رواتب الموظفين

### الإدارة
- **العملاء (Customers)** - إدارة قاعدة بيانات العملاء
- **الموردين (Vendors)** - إدارة الموردين
- **المشاريع (Projects)** - تتبع المشاريع مع الفوترة بالساعات/الأيام
- **المركبات (Vehicles)** - إدارة أسطول المركبات
- **التقارير (Reports)** - تقارير شاملة

### المميزات الإضافية
- **PIN Code Authentication** - تسجيل دخول آمن بـ PIN Code
- **إدارة المستخدمين** - Admin يمكنه إنشاء/تعديل/حذف المستخدمين
- **Responsive Design** - يعمل على جميع الأجهزة
- **PWA Support** - Progressive Web App
- **AI Assistant** - مساعد ذكي للمساعدة

## المتطلبات

- **Node.js** 18+ 
- **npm** أو **yarn**
- **PostgreSQL** (للإنتاج) - يمكن استخدام Supabase, Neon, أو أي PostgreSQL server

## التثبيت

### 1. تثبيت Dependencies

```bash
npm install
```

### 2. إعداد قاعدة البيانات

#### أ. إنشاء ملف `.env.local`

انسخ من `.env.example` واملأ القيم:

```env
# Supabase (مطلوب لجميع البيانات)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Next.js
NODE_ENV=development
NEXT_OUTPUT_MODE=standalone
```

#### ب. إنشاء الجداول في Supabase

1. افتح مشروعك في [Supabase](https://supabase.com) → **SQL Editor**
2. انسخ محتوى ملف `supabase-schema.sql` من المشروع
3. الصق ونفّذ الاستعلام لإنشاء كل الجداول
4. (اختياري) أنشئ مستخدم Admin من واجهة الإعدادات أو عبر سكربت إنشاء المستخدمين إن وُجد

### 3. التشغيل

#### الطريقة 1: استخدام run.bat (الأسهل)

```bash
run.bat
```

#### الطريقة 2: استخدام npm

```bash
npm run dev
```

ثم افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

## تسجيل الدخول

بعد إنشاء مستخدم Admin:
- **Email**: `admin@example.com`
- **PIN Code**: `1234`

⚠️ **مهم**: بعد تسجيل الدخول، غيّر PIN Code من Settings!

## Scripts المتاحة

### Development
- `npm run dev` - تشغيل Development Server
- `npm run build` - Build للإنتاج
- `npm run start` - تشغيل Production Server
- `npm run lint` - تشغيل ESLint

### Database
- `npm run db:generate` - توليد Prisma Client
- `npm run db:push` - Push Schema إلى قاعدة البيانات
- `npm run db:migrate` - إنشاء Migration جديد
- `npm run db:studio` - فتح Prisma Studio
- `npm run db:test` - اختبار اتصال قاعدة البيانات
- `npm run db:test:online` - اختبار الاتصال أونلاين
- `npm run db:seed` - إضافة بيانات تجريبية
- `npm run db:create-admin` - إنشاء/تحديث مستخدم Admin

### Deployment Setup
- `npm run setup:mcp` - إعداد MCP Servers (DigitalOcean & Namecheap)
- `npm run setup:deploy` - دليل الرفع الكامل
- `npm run setup:new` - إعداد مشروع جديد

## البنية

```
uncle-website-clean/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── customers/         # صفحات العملاء
│   ├── invoices/         # صفحات الفواتير
│   ├── quotations/       # صفحات العروض
│   └── ...
├── components/            # React Components
│   ├── layout/           # Layout Components
│   ├── shared/            # Shared Components
│   └── ui/               # UI Components
├── lib/                   # Utilities & Services
│   ├── data/             # Data Services
│   ├── hooks/            # Custom Hooks
│   └── utils/            # Utilities
├── prisma/               # Prisma Schema
├── scripts/              # Helper Scripts
│   ├── setup-*.js       # Setup Scripts
│   ├── test-*.js        # Test Scripts
│   └── create-admin-user.js
├── types/                # TypeScript Types
├── public/               # Static Files
├── .env.example          # Environment Variables Template
├── package.json
├── README.md
├── run.bat               # Quick Start Script
└── ...
```

## قاعدة البيانات والتخزين

### البيانات الرئيسية (Supabase)

جميع بيانات الأعمال (عملاء، موردين، فواتير، عروض، مشاريع، إلخ) محفوظة في **Supabase** وتُدار عبر **API Routes** (`/api/*`). بهذا تكون البيانات متاحة من أي جهاز لأي مستخدم مسجّل دخوله.

**متغيرات البيئة المطلوبة (في `.env.local`):**
- `NEXT_PUBLIC_SUPABASE_URL` — رابط مشروع Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — المفتاح العام (Anon)
- `SUPABASE_SERVICE_ROLE_KEY` — مفتاح الخدمة (سري، للـ API من السيرفر)

**إنشاء الجداول:** انسخ محتوى ملف `supabase-schema.sql` والصقه في **Supabase → SQL Editor** ثم نفّذ الاستعلام. لا حاجة لـ Prisma لجدولة Supabase.

### خدمات اختيارية (محلية)

الآتي يبقى على **localStorage** (حسب الجهاز) ولا يُزامَن مع السحابة:
- **إعدادات الشركة** (Settings): شعار، اسم شركة، بيانات الاتصال — تُستخدم في الفواتير والعروض.
- **الصلاحيات** (Permissions): أدوار وصلاحيات الواجهة — تُخزَّن محلياً.
- **الإشعارات** (Notifications): إشعارات الواجهة — محلية.

إذا رغبت بمزامنة الإعدادات أو الصلاحيات لاحقاً، يمكن إضافة جداول في Supabase وربطها بالـ API.

### الجداول في Supabase (من `supabase-schema.sql`):
- `users` - المستخدمين
- `customers` - العملاء
- `vendors` - الموردين
- `vehicles` - المركبات
- `employees` - الموظفين
- `quotations` / `quotation_items` - العروض
- `invoices` / `invoice_items` - الفواتير
- `purchase_orders` / `purchase_order_items` - أوامر الشراء
- `receipts` - الإيصالات
- `payslips` - كشوف المرتبات
- `projects` / `usage_entries` / `monthly_invoices` - المشاريع والاستخدام

## Authentication

النظام يستخدم **PIN Code Authentication**:
- تسجيل دخول بـ PIN Code فقط (لا email/username)
- Admin يمكنه إنشاء/تعديل/حذف المستخدمين من Settings
- Roles: `admin`, `manager`, `user`
- الكل يشوف كل شيء (لا RLS)

## الرفع على السيرفر

### الطريقة الموصى بها: DigitalOcean + Namecheap via Cursor MCP

#### 1. إعداد MCP Servers

```bash
npm run setup:mcp
```

- أدخل DigitalOcean API Token
- أدخل Namecheap API Credentials
- أعد تشغيل Cursor

#### 2. في Cursor Composer

استخدم الأوامر التالية:

```
"أنشئ PostgreSQL database على DigitalOcean باسم uncle_website مع 1GB storage"

"أنشئ Droplet على DigitalOcean مع Ubuntu 22.04 و 2GB RAM و Node.js 18"

"اشتري domain example.com من Namecheap"

"اربط domain example.com مع IP السيرفر"

"ارفع المشروع الحالي على DigitalOcean App Platform واربطه مع Database و Domain"
```

#### 3. أو استخدم أمر واحد شامل

```
"أنشئ PostgreSQL database باسم uncle_website، أنشئ Droplet، اشتري domain example.com، اربط Domain، وارفع المشروع على DigitalOcean"
```

### الطريقة البديلة: رفع يدوي

1. **رفع المشروع على السيرفر** (FTP/SFTP)
2. **تثبيت Dependencies**: `npm install --production`
3. **تشغيل Migrations**: `npm run db:generate && npm run db:push`
4. **إنشاء Admin User**: `npm run db:create-admin`
5. **Build**: `npm run build`
6. **تشغيل**: `pm2 start npm --name "uncle-website" -- start`

## Environment Variables

### محلياً (.env.local)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Next.js
NODE_ENV=development
NEXT_OUTPUT_MODE=standalone
```

### للإنتاج (.env.production)

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Next.js
NODE_ENV=production
NEXT_OUTPUT_MODE=standalone
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

## Troubleshooting

### المشكلة: "Cannot connect to database"

**الحل:**
1. تحقق من `DATABASE_URL` في `.env.local`
2. تحقق من أن قاعدة البيانات نشطة
3. تحقق من الاتصال بالإنترنت
4. جرب: `npm run db:test`

### المشكلة: "PIN Code لا يعمل"

**الحل:**
1. تحقق من وجود مستخدم Admin: `npm run db:create-admin`
2. تحقق من Console في المتصفح للأخطاء
3. تحقق من Network requests
4. تحقق من Cookies و Local Storage

### المشكلة: "Tables missing"

**الحل:**
1. شغّل: `npm run db:push`
2. أو استخدم SQL File: `supabase-schema.sql`

## الملفات المهمة

- `DEPLOYMENT_TEMPLATE.json` - Template للرفع (استخدمه لكل مشروع)
- `QUICK_START_DEPLOYMENT.txt` - دليل سريع للرفع
- `supabase-schema.sql` - Database Schema SQL
- `supabase-functions.sql` - Database Functions

## التكلفة المتوقعة

- **DigitalOcean Droplet (2GB)**: $12/شهر
- **DigitalOcean Database (1GB)**: $15/شهر
- **Namecheap Domain**: $10-15/سنة
- **المجموع**: ~$27-30/شهر

## الدعم

للمزيد من المعلومات:
- راجع `QUICK_START_DEPLOYMENT.txt` للرفع السريع
- راجع `DEPLOYMENT_TEMPLATE.json` للخطوات التفصيلية

---

**Version:** 1.0.0  
**Last Updated:** 2024
