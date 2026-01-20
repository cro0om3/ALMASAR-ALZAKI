# ALMSAR ALZAKI T&M - CRM System

Complete CRM system for managing quotations, invoices, customers, projects, and more.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn installed

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

Or use the batch file:
```bash
run.bat
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Features

- **Quotations Management** - Create and manage quotations
- **Invoices** - Generate and track invoices
- **Purchase Orders** - Manage purchase orders
- **Customers & Vendors** - Customer and vendor management
- **Projects** - Project tracking with hours/days billing
- **Vehicles** - Vehicle management
- **Employees & Payslips** - Employee and payroll management
- **Receipts** - Payment receipt system
- **Settings** - Configure company information and preferences

## 💾 Data Storage

The application currently uses **localStorage** for data persistence. For production deployment, you can use a database (PostgreSQL/MySQL) with Prisma ORM.

## 🚀 Deployment to Vercel

### Quick Deploy

1. **Set up Database:**
   - Option 1: Vercel Postgres (Recommended) - Go to Vercel Dashboard → Storage → Create Database
   - Option 2: Supabase - Create project at [supabase.com](https://supabase.com)
   - Option 3: PlanetScale - Create database at [planetscale.com](https://planetscale.com)

2. **Deploy to Vercel:**
   ```bash
   npm i -g vercel
   vercel login
   vercel --prod
   ```

3. **Add Environment Variables in Vercel:**
   - `DATABASE_URL` - Your database connection string
   - `OPENAI_API_KEY` - (Optional) For AI features
   - `NEXT_PUBLIC_APP_URL` - Your Vercel app URL

4. **Run Migrations:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

📖 **For detailed deployment guide, see [DEPLOYMENT.md](./DEPLOYMENT.md)**  
⚡ **For quick reference, see [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)**

## 🎨 Design

Luxury design with Gold, Dark Blue, and White color scheme.

## 📱 Mobile Support

- Responsive design
- Mobile camera integration
- PWA support (Progressive Web App)

## 🔧 Configuration

Edit company information and settings in the Settings page (`/settings`).

---

**Version:** 1.0.0  
**Last Updated:** 2024
