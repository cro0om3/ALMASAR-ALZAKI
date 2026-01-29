export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  // Identity and residence fields
  idNumber?: string // رقم الهوية
  passportNumber?: string // رقم الجواز
  residenceIssueDate?: string // تاريخ إصدار الإقامة
  residenceExpiryDate?: string // تاريخ انتهاء الإقامة
  nationality?: string // الجنسية
  createdAt: string
  updatedAt: string
}

export interface Vendor {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  contactPerson: string
  // Identity and residence fields
  idNumber?: string // رقم الهوية
  passportNumber?: string // رقم الجواز
  residenceIssueDate?: string // تاريخ إصدار الإقامة
  residenceExpiryDate?: string // تاريخ انتهاء الإقامة
  nationality?: string // الجنسية
  createdAt: string
  updatedAt: string
}

export interface QuotationItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  tax: number
  total: number
  // Support for hours/days billing
  hours?: number
  days?: number
  billingType?: 'hours' | 'days' | 'quantity' // نوع الفوترة
}

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'

export interface Quotation {
  id: string
  quotationNumber: string
  customerId: string
  customer?: Customer
  date: string
  validUntil: string
  billingType?: 'hours' | 'days' | 'quantity' // Billing type for the entire quotation
  items: QuotationItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  status: QuotationStatus
  terms: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface PurchaseOrderItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  tax: number
  total: number
}

export type PurchaseOrderStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled' | 'received'

export interface PurchaseOrder {
  id: string
  orderNumber: string
  vendorId?: string // Optional - for vendor POs
  vendor?: Vendor
  customerId?: string // Optional - for customer POs (when customer responds to quotation)
  customer?: Customer
  quotationId?: string // Link to quotation if created from quotation
  date: string
  expectedDelivery: string
  items: PurchaseOrderItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  status: PurchaseOrderStatus
  terms: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  tax: number
  total: number
  hours?: number
  days?: number
  billingType?: 'hours' | 'days' | 'quantity'
  vehicleNumber?: string // Vehicle number for car rental invoices
  grossAmount?: number // Gross amount before VAT
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export interface Invoice {
  id: string
  invoiceNumber: string
  quotationId?: string
  purchaseOrderId?: string // Link to Purchase Order
  customerId: string
  customer?: Customer
  date: string
  dueDate: string
  billingType?: 'hours' | 'days' | 'quantity' // Billing type for the entire invoice
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  paidAmount: number
  status: InvoiceStatus
  terms: string
  notes: string
  // Additional fields for PDF format
  projectName?: string
  lpoNumber?: string // LPO No.
  scopeOfWork?: string
  amountInWords?: string
  createdAt: string
  updatedAt: string
}

export interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  licensePlate: string
  vin: string
  color: string
  mileage: number
  purchaseDate: string
  purchasePrice: number
  status: 'active' | 'maintenance' | 'retired'
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Employee {
  id: string
  employeeNumber: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  position: string
  department: string
  hireDate: string
  salary: number
  status: 'active' | 'inactive' | 'terminated'
  // Identity and residence fields
  idNumber?: string // رقم الهوية
  passportNumber?: string // رقم الجواز
  residenceIssueDate?: string // تاريخ إصدار الإقامة
  residenceExpiryDate?: string // تاريخ انتهاء الإقامة
  nationality?: string // الجنسية
  createdAt: string
  updatedAt: string
}

export interface Payslip {
  id: string
  payslipNumber: string
  employeeId: string
  employee?: Employee
  payPeriodStart: string
  payPeriodEnd: string
  issueDate: string
  baseSalary: number
  overtime: number
  bonuses: number
  deductions: number
  tax: number
  netPay: number
  status: 'draft' | 'issued' | 'paid'
  paymentMethod?: PaymentMethod // Method of payment
  paymentDate?: string // Date when payment was made
  notes: string
  createdAt: string
  updatedAt: string
}

export type PaymentMethod = 'cash' | 'bank_transfer' | 'cheque' | 'credit_card' | 'other'

export type ReceiptStatus = 'draft' | 'issued' | 'cancelled'

export type NotificationType = 'residence_expiring' | 'invoice_overdue' | 'invoice_pending' | 'payslip_unpaid'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  entityId?: string // ID of related entity (customerId, invoiceId, etc.)
  entityType?: 'customer' | 'vendor' | 'employee' | 'invoice' | 'payslip'
  read: boolean
  createdAt: string
  link?: string // Optional link to related page
}

export interface Receipt {
  id: string
  receiptNumber: string
  invoiceId: string
  invoice?: Invoice
  customerId: string
  customer?: Customer
  date: string
  paymentDate: string
  amount: number
  paymentMethod: PaymentMethod
  referenceNumber?: string // Cheque number, transaction ID, etc.
  bankName?: string
  notes?: string
  paymentImageUrl?: string // Base64 or URL for payment proof image (check, transfer receipt, etc.)
  status: ReceiptStatus
  createdAt: string
  updatedAt: string
}

// Permissions System
export type Permission =
  | 'edit_quotations'
  | 'edit_invoices'
  | 'edit_purchase_orders'
  | 'edit_receipts'
  | 'edit_customers'
  | 'edit_vendors'
  | 'edit_employees'
  | 'edit_payslips'
  | 'edit_vehicles'
  | 'edit_projects'
  | 'edit_settings'
  | 'delete_quotations'
  | 'delete_invoices'
  | 'delete_purchase_orders'
  | 'delete_customers'
  | 'delete_vendors'
  | 'delete_employees'
  | 'delete_payslips'
  | 'delete_vehicles'
  | 'delete_projects'

export type UserRole = 'admin' | 'manager' | 'user' | 'viewer'

export interface RolePermissions {
  role: UserRole
  permissions: Permission[]
  description: string
}

export interface PermissionConfig {
  currentRole: UserRole
  roles: Record<UserRole, RolePermissions>
  customPermissions?: Permission[] // For custom user permissions
}
