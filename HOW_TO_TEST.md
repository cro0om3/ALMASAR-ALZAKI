# 🧪 How to Test Database Connection

## Method 1: Test Locally (Before Deploy) ⭐

### Step 1: Create `.env.local` file

Create a file named `.env.local` in the project root:

```env
DATABASE_URL=postgresql://postgres:Fhd%402992692Fhd@db.tundlptcusiogiaagsba.supabase.co:5432/postgres
```

### Step 2: Run the test script

```bash
npm run db:test
```

Or directly:
```bash
node test-db.js
```

### Expected Output:
```
🔍 Testing Supabase Database Connection...

✅ DATABASE_URL is set
📍 Database: Supabase
🔌 Connecting to database...

✅ Database connection successful!

📋 Checking tables...

Found 13 tables:

  ✅ users
  ✅ customers
  ✅ vendors
  ✅ vehicles
  ✅ employees
  ✅ quotations
  ✅ quotation_items
  ✅ invoices
  ✅ invoice_items
  ✅ purchase_orders
  ✅ purchase_order_items
  ✅ receipts
  ✅ payslips

📊 Testing queries...

  ✅ Customers table: 0 records
  ✅ Quotations table: 0 records
  ✅ Invoices table: 0 records
  ✅ Employees table: 0 records
  ✅ Vehicles table: 0 records

🎉 All tests passed! Database is ready to use!
```

---

## Method 2: Test Online (After Deploy) 🌐

### Step 1: Make sure DATABASE_URL is set in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Make sure `DATABASE_URL` is set with value:
   ```
   postgresql://postgres:Fhd%402992692Fhd@db.tundlptcusiogiaagsba.supabase.co:5432/postgres
   ```

### Step 2: Visit the API endpoint

Open your browser and go to:
```
https://your-app.vercel.app/api/test-db
```

Or use curl:
```bash
curl https://your-app.vercel.app/api/test-db
```

### Expected Response (JSON):
```json
{
  "success": true,
  "message": "Database connection successful!",
  "database": {
    "url": "Set ✅",
    "connected": true,
    "tables": {
      "total": 13,
      "expected": 13,
      "found": [
        "users",
        "customers",
        "vendors",
        "vehicles",
        "employees",
        "quotations",
        "quotation_items",
        "invoices",
        "invoice_items",
        "purchase_orders",
        "purchase_order_items",
        "receipts",
        "payslips"
      ],
      "missing": []
    }
  },
  "data": {
    "customers": 0,
    "quotations": 0,
    "invoices": 0,
    "employees": 0,
    "vehicles": 0,
    "vendors": 0
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## Method 3: Test from Supabase SQL Editor 🔍

1. Go to: **https://supabase.com/dashboard/project/tundlptcusiogiaagsba/sql**
2. Run this query:

```sql
-- Check all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check table counts
SELECT 
  'customers' as table_name, COUNT(*) as count FROM customers
UNION ALL
SELECT 'quotations', COUNT(*) FROM quotations
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'employees', COUNT(*) FROM employees
UNION ALL
SELECT 'vehicles', COUNT(*) FROM vehicles;
```

---

## 🐛 Troubleshooting

### Error: "DATABASE_URL is not set"
**Solution:**
- Make sure `.env.local` exists locally
- Make sure `DATABASE_URL` is set in Vercel Environment Variables

### Error: "Table does not exist"
**Solution:**
1. Go to Supabase SQL Editor
2. Copy content from `supabase-schema.sql`
3. Paste and run in SQL Editor

### Error: "Connection failed"
**Solution:**
- Check if Supabase project is active
- Verify DATABASE_URL is correct
- Check internet connection

---

## ✅ Quick Test Checklist

- [ ] `.env.local` file exists (for local testing)
- [ ] `DATABASE_URL` is set in Vercel (for online testing)
- [ ] Tables are created in Supabase (run `supabase-schema.sql`)
- [ ] Run `npm run db:test` locally
- [ ] Visit `/api/test-db` online

---

**💡 Tip:** Always test locally first, then test online after deploy!
