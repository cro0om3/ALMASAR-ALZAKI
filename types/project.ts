// Project/Contract Types - نظام إدارة المشاريع والعقود

export type ProjectStatus = 'draft' | 'quotation_sent' | 'po_received' | 'active' | 'completed' | 'cancelled'
export type BillingType = 'hours' | 'days' | 'fixed' // الساعات أو الأيام أو مبلغ ثابت

export interface Project {
  id: string
  projectNumber: string
  quotationId: string // ربط مع الكوتيشن
  customerId: string
  customer?: any // Customer type
  
  // معلومات المشروع
  title: string
  description: string
  startDate: string
  endDate?: string
  
  // نوع الفوترة
  billingType: BillingType // 'hours' | 'days' | 'fixed'
  hourlyRate?: number // السعر بالساعة
  dailyRate?: number // السعر باليوم
  fixedAmount?: number // المبلغ الثابت
  
  // ربط مع PO
  poNumber?: string // رقم طلب الشراء من العميل
  poDate?: string
  poReceived: boolean
  
  // ربط مع المركبات
  assignedVehicles: string[] // IDs of vehicles
  vehicles?: any[] // Vehicle details
  
  // الحالة
  status: ProjectStatus
  
  // معلومات إضافية
  terms: string
  notes: string
  
  createdAt: string
  updatedAt: string
}

// تتبع الاستخدام (الساعات/الأيام)
export interface UsageEntry {
  id: string
  projectId: string
  project?: Project
  
  vehicleId: string
  vehicle?: any // Vehicle details
  
  date: string // تاريخ الاستخدام
  hours?: number // عدد الساعات (إذا كان المشروع بالساعات)
  days?: number // عدد الأيام (إذا كان المشروع بالأيام)
  
  startTime?: string // وقت البدء (للساعات)
  endTime?: string // وقت الانتهاء (للساعات)
  
  description: string // وصف العمل
  location?: string // موقع العمل
  
  // الحسابات
  rate: number // السعر (ساعة أو يوم)
  total: number // الإجمالي
  
  // حالة الفوترة
  invoiced: boolean // هل تم فوترتها؟
  invoiceId?: string // رقم الفاتورة إذا تمت الفوترة
  
  createdAt: string
  updatedAt: string
}

// فاتورة شهرية - تحتوي على استخدامات المشروع
export interface MonthlyInvoice {
  id: string
  invoiceNumber: string
  projectId: string
  project?: Project
  
  customerId: string
  customer?: any
  
  // الفترة
  month: number // 1-12
  year: number
  
  // الاستخدامات المضمنة
  usageEntries: string[] // IDs of UsageEntry
  usageDetails?: UsageEntry[]
  
  // الحسابات
  totalHours?: number // إجمالي الساعات
  totalDays?: number // إجمالي الأيام
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  
  // الحالة
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  date: string
  dueDate: string
  paidAmount: number
  
  notes: string
  createdAt: string
  updatedAt: string
}
