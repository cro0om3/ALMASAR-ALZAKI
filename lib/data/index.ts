import { 
  Quotation, 
  Customer, 
  Invoice, 
  PurchaseOrder, 
  Vendor, 
  Vehicle, 
  Employee, 
  Payslip,
  Receipt
} from "@/types"
import { settingsService } from "./settings-service"

// Export project services
export * from "./project-service"

// Export seed data function
export { seedDummyData } from "./seed-data"

// Export settings service
export { settingsService } from "./settings-service"

// In-memory storage (will be replaced with localStorage)
let quotations: Quotation[] = []
let customers: Customer[] = []
let invoices: Invoice[] = []
let purchaseOrders: PurchaseOrder[] = []
let vendors: Vendor[] = []
let vehicles: Vehicle[] = []
let employees: Employee[] = []
let payslips: Payslip[] = []
let receipts: Receipt[] = []

// Initialize from localStorage if available
if (typeof window !== 'undefined') {
  const loadFromStorage = () => {
    try {
      quotations = JSON.parse(localStorage.getItem('quotations') || '[]')
      customers = JSON.parse(localStorage.getItem('customers') || '[]')
      invoices = JSON.parse(localStorage.getItem('invoices') || '[]')
      purchaseOrders = JSON.parse(localStorage.getItem('purchaseOrders') || '[]')
      vendors = JSON.parse(localStorage.getItem('vendors') || '[]')
      vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]')
      employees = JSON.parse(localStorage.getItem('employees') || '[]')
      payslips = JSON.parse(localStorage.getItem('payslips') || '[]')
      receipts = JSON.parse(localStorage.getItem('receipts') || '[]')
    } catch (error) {
      console.error('Error loading from localStorage:', error)
    }
  }
  loadFromStorage()
}

const saveToStorage = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }
}

// Quotations
export const quotationService = {
  getAll: (): Quotation[] => quotations,
  getById: (id: string): Quotation | undefined => quotations.find(q => q.id === id),
  create: (quotation: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>): Quotation => {
    const newQuotation: Quotation = {
      ...quotation,
      quotationNumber: quotation.quotationNumber || settingsService.generateQuotationNumber(),
      id: `QT-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    quotations.push(newQuotation)
    saveToStorage('quotations', quotations)
    return newQuotation
  },
  update: (id: string, updates: Partial<Quotation>): Quotation | null => {
    const index = quotations.findIndex(q => q.id === id)
    if (index === -1) return null
    quotations[index] = { ...quotations[index], ...updates, updatedAt: new Date().toISOString() }
    saveToStorage('quotations', quotations)
    return quotations[index]
  },
  delete: (id: string): boolean => {
    const index = quotations.findIndex(q => q.id === id)
    if (index === -1) return false
    quotations.splice(index, 1)
    saveToStorage('quotations', quotations)
    return true
  },
}

// Customers
export const customerService = {
  getAll: (): Customer[] => customers,
  getById: (id: string): Customer | undefined => customers.find(c => c.id === id),
  create: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer => {
    const newCustomer: Customer = {
      ...customer,
      id: `CUST-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    customers.push(newCustomer)
    saveToStorage('customers', customers)
    return newCustomer
  },
  update: (id: string, updates: Partial<Customer>): Customer | null => {
    const index = customers.findIndex(c => c.id === id)
    if (index === -1) return null
    customers[index] = { ...customers[index], ...updates, updatedAt: new Date().toISOString() }
    saveToStorage('customers', customers)
    return customers[index]
  },
  delete: (id: string): boolean => {
    const index = customers.findIndex(c => c.id === id)
    if (index === -1) return false
    customers.splice(index, 1)
    saveToStorage('customers', customers)
    return true
  },
}

// Invoices
export const invoiceService = {
  getAll: (): Invoice[] => invoices,
  getById: (id: string): Invoice | undefined => invoices.find(i => i.id === id),
  create: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Invoice => {
    const newInvoice: Invoice = {
      ...invoice,
      invoiceNumber: invoice.invoiceNumber || settingsService.generateInvoiceNumber(),
      id: `INV-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    invoices.push(newInvoice)
    saveToStorage('invoices', invoices)
    return newInvoice
  },
  update: (id: string, updates: Partial<Invoice>): Invoice | null => {
    const index = invoices.findIndex(i => i.id === id)
    if (index === -1) return null
    invoices[index] = { ...invoices[index], ...updates, updatedAt: new Date().toISOString() }
    saveToStorage('invoices', invoices)
    return invoices[index]
  },
  delete: (id: string): boolean => {
    const index = invoices.findIndex(i => i.id === id)
    if (index === -1) return false
    invoices.splice(index, 1)
    saveToStorage('invoices', invoices)
    return true
  },
}

// Purchase Orders
export const purchaseOrderService = {
  getAll: (): PurchaseOrder[] => purchaseOrders,
  getById: (id: string): PurchaseOrder | undefined => purchaseOrders.find(po => po.id === id),
  getByQuotationId: (quotationId: string): PurchaseOrder[] => purchaseOrders.filter(po => po.quotationId === quotationId),
  getByCustomerId: (customerId: string): PurchaseOrder[] => purchaseOrders.filter(po => po.customerId === customerId),
  getCustomerPOs: (): PurchaseOrder[] => purchaseOrders.filter(po => po.customerId),
  getVendorPOs: (): PurchaseOrder[] => purchaseOrders.filter(po => po.vendorId),
  create: (order: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>): PurchaseOrder => {
    const newOrder: PurchaseOrder = {
      ...order,
      id: `PO-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    purchaseOrders.push(newOrder)
    saveToStorage('purchaseOrders', purchaseOrders)
    return newOrder
  },
  update: (id: string, updates: Partial<PurchaseOrder>): PurchaseOrder | null => {
    const index = purchaseOrders.findIndex(po => po.id === id)
    if (index === -1) return null
    purchaseOrders[index] = { ...purchaseOrders[index], ...updates, updatedAt: new Date().toISOString() }
    saveToStorage('purchaseOrders', purchaseOrders)
    return purchaseOrders[index]
  },
  delete: (id: string): boolean => {
    const index = purchaseOrders.findIndex(po => po.id === id)
    if (index === -1) return false
    purchaseOrders.splice(index, 1)
    saveToStorage('purchaseOrders', purchaseOrders)
    return true
  },
}

// Vendors
export const vendorService = {
  getAll: (): Vendor[] => vendors,
  getById: (id: string): Vendor | undefined => vendors.find(v => v.id === id),
  create: (vendor: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>): Vendor => {
    const newVendor: Vendor = {
      ...vendor,
      id: `VEND-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    vendors.push(newVendor)
    saveToStorage('vendors', vendors)
    return newVendor
  },
  update: (id: string, updates: Partial<Vendor>): Vendor | null => {
    const index = vendors.findIndex(v => v.id === id)
    if (index === -1) return null
    vendors[index] = { ...vendors[index], ...updates, updatedAt: new Date().toISOString() }
    saveToStorage('vendors', vendors)
    return vendors[index]
  },
  delete: (id: string): boolean => {
    const index = vendors.findIndex(v => v.id === id)
    if (index === -1) return false
    vendors.splice(index, 1)
    saveToStorage('vendors', vendors)
    return true
  },
}

// Vehicles
export const vehicleService = {
  getAll: (): Vehicle[] => vehicles,
  getById: (id: string): Vehicle | undefined => vehicles.find(v => v.id === id),
  create: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Vehicle => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: `VEH-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    vehicles.push(newVehicle)
    saveToStorage('vehicles', vehicles)
    return newVehicle
  },
  update: (id: string, updates: Partial<Vehicle>): Vehicle | null => {
    const index = vehicles.findIndex(v => v.id === id)
    if (index === -1) return null
    vehicles[index] = { ...vehicles[index], ...updates, updatedAt: new Date().toISOString() }
    saveToStorage('vehicles', vehicles)
    return vehicles[index]
  },
  delete: (id: string): boolean => {
    const index = vehicles.findIndex(v => v.id === id)
    if (index === -1) return false
    vehicles.splice(index, 1)
    saveToStorage('vehicles', vehicles)
    return true
  },
}

// Employees
export const employeeService = {
  getAll: (): Employee[] => employees,
  getById: (id: string): Employee | undefined => employees.find(e => e.id === id),
  create: (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Employee => {
    const newEmployee: Employee = {
      ...employee,
      id: `EMP-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    employees.push(newEmployee)
    saveToStorage('employees', employees)
    return newEmployee
  },
  update: (id: string, updates: Partial<Employee>): Employee | null => {
    const index = employees.findIndex(e => e.id === id)
    if (index === -1) return null
    employees[index] = { ...employees[index], ...updates, updatedAt: new Date().toISOString() }
    saveToStorage('employees', employees)
    return employees[index]
  },
  delete: (id: string): boolean => {
    const index = employees.findIndex(e => e.id === id)
    if (index === -1) return false
    employees.splice(index, 1)
    saveToStorage('employees', employees)
    return true
  },
}

// Payslips
export const payslipService = {
  getAll: (): Payslip[] => payslips,
  getById: (id: string): Payslip | undefined => payslips.find(p => p.id === id),
  getByEmployeeId: (employeeId: string): Payslip[] => payslips.filter(p => p.employeeId === employeeId),
  create: (payslip: Omit<Payslip, 'id' | 'createdAt' | 'updatedAt'>): Payslip => {
    const newPayslip: Payslip = {
      ...payslip,
      id: `PAY-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    payslips.push(newPayslip)
    saveToStorage('payslips', payslips)
    return newPayslip
  },
  update: (id: string, updates: Partial<Payslip>): Payslip | null => {
    const index = payslips.findIndex(p => p.id === id)
    if (index === -1) return null
    payslips[index] = { ...payslips[index], ...updates, updatedAt: new Date().toISOString() }
    saveToStorage('payslips', payslips)
    return payslips[index]
  },
  delete: (id: string): boolean => {
    const index = payslips.findIndex(p => p.id === id)
    if (index === -1) return false
    payslips.splice(index, 1)
    saveToStorage('payslips', payslips)
    return true
  },
  // Generate monthly payslips for all active employees
  generateMonthlyPayslips: (month: number, year: number): Payslip[] => {
    const activeEmployees = employees.filter(e => e.status === 'active')
    const generatedPayslips: Payslip[] = []

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    activeEmployees.forEach((employee) => {
      // Check if payslip already exists for this employee, month, and year
      const existingPayslip = payslips.find(p => {
        if (p.employeeId !== employee.id) return false
        const payStart = new Date(p.payPeriodStart)
        return payStart.getMonth() + 1 === month && payStart.getFullYear() === year
      })

      if (!existingPayslip) {
        const newPayslip: Payslip = {
          payslipNumber: `PAY-${employee.employeeNumber}-${year}-${String(month).padStart(2, '0')}`,
          employeeId: employee.id,
          payPeriodStart: startDate.toISOString().split('T')[0],
          payPeriodEnd: endDate.toISOString().split('T')[0],
          issueDate: new Date().toISOString().split('T')[0],
          baseSalary: employee.salary || 0,
          overtime: 0,
          bonuses: 0,
          deductions: 0,
          tax: 0,
          netPay: employee.salary || 0,
          status: 'issued',
          notes: '',
          id: `PAY-${Date.now()}-${employee.id}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        payslips.push(newPayslip)
        generatedPayslips.push(newPayslip)
      }
    })

    if (generatedPayslips.length > 0) {
      saveToStorage('payslips', payslips)
    }

    return generatedPayslips
  },
}

// Receipts Service
export const receiptService = {
  getAll: (): Receipt[] => receipts,
  getById: (id: string): Receipt | undefined => receipts.find(r => r.id === id),
  getByInvoiceId: (invoiceId: string): Receipt[] => receipts.filter(r => r.invoiceId === invoiceId),
  create: (receipt: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>): Receipt => {
    const newReceipt: Receipt = {
      ...receipt,
      receiptNumber: receipt.receiptNumber || settingsService.generateReceiptNumber(),
      id: `RCP-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    receipts.push(newReceipt)
    
    // Update invoice paid amount and status
    const invoice = invoiceService.getById(receipt.invoiceId)
    if (invoice) {
      const totalPaid = receipts
        .filter(r => r.invoiceId === receipt.invoiceId && r.status !== 'cancelled')
        .reduce((sum, r) => sum + r.amount, 0)
      
      let newStatus = invoice.status
      if (totalPaid >= invoice.total) {
        newStatus = 'paid'
      } else if (totalPaid > 0 && invoice.status === 'draft') {
        newStatus = 'sent'
      } else if (new Date(invoice.dueDate) < new Date() && totalPaid < invoice.total) {
        newStatus = 'overdue'
      }
      
      invoiceService.update(invoice.id, {
        paidAmount: totalPaid,
        status: newStatus as any,
      })
    }
    
    saveToStorage('receipts', receipts)
    return newReceipt
  },
  update: (id: string, updates: Partial<Receipt>): Receipt | null => {
    const index = receipts.findIndex(r => r.id === id)
    if (index === -1) return null
    
    const oldReceipt = receipts[index]
    receipts[index] = { ...receipts[index], ...updates, updatedAt: new Date().toISOString() }
    
    // Update invoice paid amount if receipt amount changed
    if (updates.amount !== undefined || updates.status !== undefined) {
      const invoice = invoiceService.getById(oldReceipt.invoiceId)
      if (invoice) {
        const totalPaid = receipts
          .filter(r => r.invoiceId === oldReceipt.invoiceId && r.status !== 'cancelled')
          .reduce((sum, r) => sum + r.amount, 0)
        
        let newStatus = invoice.status
        if (totalPaid >= invoice.total) {
          newStatus = 'paid'
        } else if (totalPaid > 0 && invoice.status === 'draft') {
          newStatus = 'sent'
        } else if (new Date(invoice.dueDate) < new Date() && totalPaid < invoice.total) {
          newStatus = 'overdue'
        }
        
        invoiceService.update(invoice.id, {
          paidAmount: totalPaid,
          status: newStatus as any,
        })
      }
    }
    
    saveToStorage('receipts', receipts)
    return receipts[index]
  },
  delete: (id: string): boolean => {
    const index = receipts.findIndex(r => r.id === id)
    if (index === -1) return false
    
    const receipt = receipts[index]
    receipts.splice(index, 1)
    
    // Update invoice paid amount
    const invoice = invoiceService.getById(receipt.invoiceId)
    if (invoice) {
      const totalPaid = receipts
        .filter(r => r.invoiceId === receipt.invoiceId && r.status !== 'cancelled')
        .reduce((sum, r) => sum + r.amount, 0)
      
      let newStatus = invoice.status
      if (totalPaid >= invoice.total) {
        newStatus = 'paid'
      } else if (totalPaid > 0 && invoice.status === 'draft') {
        newStatus = 'sent'
      } else if (new Date(invoice.dueDate) < new Date() && totalPaid < invoice.total) {
        newStatus = 'overdue'
      }
      
      invoiceService.update(invoice.id, {
        paidAmount: totalPaid,
        status: newStatus as any,
      })
    }
    
    saveToStorage('receipts', receipts)
    return true
  },
  getPendingPayments: (): Invoice[] => {
    return invoices.filter(inv => {
      const totalPaid = receipts
        .filter(r => r.invoiceId === inv.id && r.status !== 'cancelled')
        .reduce((sum, r) => sum + r.amount, 0)
      return totalPaid < inv.total && inv.status !== 'cancelled'
    })
  },
}
