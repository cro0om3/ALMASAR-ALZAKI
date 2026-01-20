import { Notification } from "@/types"
import { calculateDaysRemaining, getResidenceStatus } from "@/lib/utils"
import { customerService, vendorService, employeeService, invoiceService, payslipService } from "@/lib/data"

const STORAGE_KEY = 'notifications'
const READ_NOTIFICATIONS_KEY = 'readNotifications'

// Load notifications from localStorage
function loadNotifications(): Notification[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

// Save notifications to localStorage
function saveNotifications(notifications: Notification[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
}

// Load read notification IDs
function loadReadNotifications(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  const stored = localStorage.getItem(READ_NOTIFICATIONS_KEY)
  return stored ? new Set(JSON.parse(stored)) : new Set()
}

// Save read notification IDs
function saveReadNotifications(readIds: Set<string>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(Array.from(readIds)))
}

// Generate residence expiring notifications
function generateResidenceNotifications(): Notification[] {
  const notifications: Notification[] = []
  const now = new Date().toISOString()

  // Check Customers
  const customers = customerService.getAll()
  customers.forEach((customer) => {
    if (customer.residenceExpiryDate) {
      const status = getResidenceStatus(customer.residenceExpiryDate)
      if (status === 'expired' || status === 'critical' || status === 'warning') {
        const daysRemaining = calculateDaysRemaining(customer.residenceExpiryDate)
        const daysText = daysRemaining < 0 ? 'منتهية' : `${daysRemaining} يوم متبقي`
        notifications.push({
          id: `residence-customer-${customer.id}`,
          type: 'residence_expiring',
          title: `إقامة عميل منتهية قريباً`,
          message: `إقامة العميل ${customer.name} تنتهي: ${daysText}`,
          entityId: customer.id,
          entityType: 'customer',
          read: false,
          createdAt: now,
          link: `/customers/${customer.id}`,
        })
      }
    }
  })

  // Check Vendors
  const vendors = vendorService.getAll()
  vendors.forEach((vendor) => {
    if (vendor.residenceExpiryDate) {
      const status = getResidenceStatus(vendor.residenceExpiryDate)
      if (status === 'expired' || status === 'critical' || status === 'warning') {
        const daysRemaining = calculateDaysRemaining(vendor.residenceExpiryDate)
        const daysText = daysRemaining < 0 ? 'منتهية' : `${daysRemaining} يوم متبقي`
        notifications.push({
          id: `residence-vendor-${vendor.id}`,
          type: 'residence_expiring',
          title: `إقامة مورد منتهية قريباً`,
          message: `إقامة المورد ${vendor.name} تنتهي: ${daysText}`,
          entityId: vendor.id,
          entityType: 'vendor',
          read: false,
          createdAt: now,
          link: `/vendors/${vendor.id}`,
        })
      }
    }
  })

  // Check Employees
  const employees = employeeService.getAll()
  employees.forEach((employee) => {
    if (employee.residenceExpiryDate) {
      const status = getResidenceStatus(employee.residenceExpiryDate)
      if (status === 'expired' || status === 'critical' || status === 'warning') {
        const daysRemaining = calculateDaysRemaining(employee.residenceExpiryDate)
        const daysText = daysRemaining < 0 ? 'منتهية' : `${daysRemaining} يوم متبقي`
        notifications.push({
          id: `residence-employee-${employee.id}`,
          type: 'residence_expiring',
          title: `إقامة موظف منتهية قريباً`,
          message: `إقامة الموظف ${employee.firstName} ${employee.lastName} تنتهي: ${daysText}`,
          entityId: employee.id,
          entityType: 'employee',
          read: false,
          createdAt: now,
          link: `/employees/${employee.id}`,
        })
      }
    }
  })

  return notifications
}

// Generate invoice overdue notifications
function generateInvoiceOverdueNotifications(): Notification[] {
  const notifications: Notification[] = []
  const now = new Date().toISOString()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const invoices = invoiceService.getAll()
  invoices.forEach((invoice) => {
    if (invoice.status === 'sent' || invoice.status === 'overdue') {
      const dueDate = new Date(invoice.dueDate)
      dueDate.setHours(0, 0, 0, 0)

      if (dueDate < today) {
        const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        notifications.push({
          id: `invoice-overdue-${invoice.id}`,
          type: 'invoice_overdue',
          title: `فاتورة مستحقة الدفع`,
          message: `الفاتورة ${invoice.invoiceNumber} متأخرة ${daysOverdue} يوم - المبلغ: ${invoice.total - invoice.paidAmount}`,
          entityId: invoice.id,
          entityType: 'invoice',
          read: false,
          createdAt: now,
          link: `/invoices/${invoice.id}`,
        })
      }
    }
  })

  return notifications
}

// Generate invoice pending notifications
function generateInvoicePendingNotifications(): Notification[] {
  const notifications: Notification[] = []
  const now = new Date().toISOString()

  const invoices = invoiceService.getAll()
  invoices.forEach((invoice) => {
    if (invoice.status === 'sent' && invoice.paidAmount < invoice.total) {
      notifications.push({
        id: `invoice-pending-${invoice.id}`,
        type: 'invoice_pending',
        title: `فاتورة معلقة`,
        message: `الفاتورة ${invoice.invoiceNumber} لم يتم دفعها بالكامل - المبلغ المتبقي: ${invoice.total - invoice.paidAmount}`,
        entityId: invoice.id,
        entityType: 'invoice',
        read: false,
        createdAt: now,
        link: `/invoices/${invoice.id}`,
      })
    }
  })

  return notifications
}

// Generate payslip unpaid notifications
function generatePayslipUnpaidNotifications(): Notification[] {
  const notifications: Notification[] = []
  const now = new Date().toISOString()

  const payslips = payslipService.getAll()
  payslips.forEach((payslip) => {
    if (payslip.status === 'issued' || payslip.status === 'draft') {
      const employee = employeeService.getById(payslip.employeeId)
      notifications.push({
        id: `payslip-unpaid-${payslip.id}`,
        type: 'payslip_unpaid',
        title: `راتب غير مدفوع`,
        message: `راتب الموظف ${employee?.firstName} ${employee?.lastName || ''} - ${payslip.payslipNumber} - المبلغ: ${payslip.netPay}`,
        entityId: payslip.id,
        entityType: 'payslip',
        read: false,
        createdAt: now,
        link: `/payslips/${payslip.id}`,
      })
    }
  })

  return notifications
}

export const notificationService = {
  // Get all notifications (generated on demand)
  getAll: (): Notification[] => {
    const readIds = loadReadNotifications()
    
    const notifications = [
      ...generateResidenceNotifications(),
      ...generateInvoiceOverdueNotifications(),
      ...generateInvoicePendingNotifications(),
      ...generatePayslipUnpaidNotifications(),
    ]

    // Mark as read if in readIds
    return notifications.map((n) => ({
      ...n,
      read: readIds.has(n.id),
    }))
  },

  // Get unread notifications
  getUnread: (): Notification[] => {
    return notificationService.getAll().filter((n) => !n.read)
  },

  // Get unread count
  getUnreadCount: (): number => {
    return notificationService.getUnread().length
  },

  // Mark notification as read
  markAsRead: (id: string): void => {
    const readIds = loadReadNotifications()
    readIds.add(id)
    saveReadNotifications(readIds)
  },

  // Mark all as read
  markAllAsRead: (): void => {
    const notifications = notificationService.getAll()
    const readIds = new Set(notifications.map((n) => n.id))
    saveReadNotifications(readIds)
  },

  // Delete notification (remove from read list)
  delete: (id: string): void => {
    const readIds = loadReadNotifications()
    readIds.add(id) // Mark as read to hide it
    saveReadNotifications(readIds)
  },
}
