import { prisma } from '@/lib/prisma'
import type {
  Customer,
  Vendor,
  Quotation,
  Invoice,
  PurchaseOrder,
  Vehicle,
  Employee,
  Payslip,
} from '@/types'

// Helper to check if Prisma is available
const checkPrisma = () => {
  if (!prisma) {
    throw new Error('Prisma is not set up. Please run: npx prisma generate')
  }
}

// Customers
export const dbCustomerService = {
  getAll: async (): Promise<Customer[]> => {
    checkPrisma()
    return await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    })
  },

  getById: async (id: string): Promise<Customer | null> => {
    return await prisma.customer.findUnique({ where: { id } })
  },

  create: async (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> => {
    return await prisma.customer.create({ data })
  },

  update: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    return await prisma.customer.update({ where: { id }, data })
  },

  delete: async (id: string): Promise<void> => {
    await prisma.customer.delete({ where: { id } })
  },
}

// Vendors
export const dbVendorService = {
  getAll: async (): Promise<Vendor[]> => {
    return await prisma.vendor.findMany({
      orderBy: { createdAt: 'desc' },
    })
  },

  getById: async (id: string): Promise<Vendor | null> => {
    return await prisma.vendor.findUnique({ where: { id } })
  },

  create: async (data: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vendor> => {
    return await prisma.vendor.create({ data })
  },

  update: async (id: string, data: Partial<Vendor>): Promise<Vendor> => {
    return await prisma.vendor.update({ where: { id }, data })
  },

  delete: async (id: string): Promise<void> => {
    await prisma.vendor.delete({ where: { id } })
  },
}

// Quotations
export const dbQuotationService = {
  getAll: async (): Promise<Quotation[]> => {
    return await prisma.quotation.findMany({
      include: { customer: true, items: true },
      orderBy: { createdAt: 'desc' },
    })
  },

  getById: async (id: string): Promise<Quotation | null> => {
    return await prisma.quotation.findUnique({
      where: { id },
      include: { customer: true, items: true },
    })
  },

  create: async (data: any): Promise<Quotation> => {
    const { items, ...quotationData } = data
    return await prisma.quotation.create({
      data: {
        ...quotationData,
        items: {
          create: items,
        },
      },
      include: { customer: true, items: true },
    })
  },

  update: async (id: string, data: any): Promise<Quotation> => {
    const { items, ...quotationData } = data
    
    // Delete existing items and create new ones
    await prisma.quotationItem.deleteMany({ where: { quotationId: id } })
    
    return await prisma.quotation.update({
      where: { id },
      data: {
        ...quotationData,
        items: {
          create: items || [],
        },
      },
      include: { customer: true, items: true },
    })
  },

  delete: async (id: string): Promise<void> => {
    await prisma.quotation.delete({ where: { id } })
  },
}

// Invoices
export const dbInvoiceService = {
  getAll: async (): Promise<Invoice[]> => {
    return await prisma.invoice.findMany({
      include: { customer: true, items: true },
      orderBy: { createdAt: 'desc' },
    })
  },

  getById: async (id: string): Promise<Invoice | null> => {
    return await prisma.invoice.findUnique({
      where: { id },
      include: { customer: true, items: true },
    })
  },

  create: async (data: any): Promise<Invoice> => {
    const { items, ...invoiceData } = data
    return await prisma.invoice.create({
      data: {
        ...invoiceData,
        items: {
          create: items,
        },
      },
      include: { customer: true, items: true },
    })
  },

  update: async (id: string, data: any): Promise<Invoice> => {
    const { items, ...invoiceData } = data
    
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } })
    
    return await prisma.invoice.update({
      where: { id },
      data: {
        ...invoiceData,
        items: {
          create: items || [],
        },
      },
      include: { customer: true, items: true },
    })
  },

  delete: async (id: string): Promise<void> => {
    await prisma.invoice.delete({ where: { id } })
  },
}

// Purchase Orders
export const dbPurchaseOrderService = {
  getAll: async (): Promise<PurchaseOrder[]> => {
    return await prisma.purchaseOrder.findMany({
      include: { vendor: true, items: true },
      orderBy: { createdAt: 'desc' },
    })
  },

  getById: async (id: string): Promise<PurchaseOrder | null> => {
    return await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { vendor: true, items: true },
    })
  },

  create: async (data: any): Promise<PurchaseOrder> => {
    const { items, ...orderData } = data
    return await prisma.purchaseOrder.create({
      data: {
        ...orderData,
        items: {
          create: items,
        },
      },
      include: { vendor: true, items: true },
    })
  },

  update: async (id: string, data: any): Promise<PurchaseOrder> => {
    const { items, ...orderData } = data
    
    await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } })
    
    return await prisma.purchaseOrder.update({
      where: { id },
      data: {
        ...orderData,
        items: {
          create: items || [],
        },
      },
      include: { vendor: true, items: true },
    })
  },

  delete: async (id: string): Promise<void> => {
    await prisma.purchaseOrder.delete({ where: { id } })
  },
}

// Vehicles
export const dbVehicleService = {
  getAll: async (): Promise<Vehicle[]> => {
    return await prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
    })
  },

  getById: async (id: string): Promise<Vehicle | null> => {
    return await prisma.vehicle.findUnique({ where: { id } })
  },

  create: async (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> => {
    return await prisma.vehicle.create({ data })
  },

  update: async (id: string, data: Partial<Vehicle>): Promise<Vehicle> => {
    return await prisma.vehicle.update({ where: { id }, data })
  },

  delete: async (id: string): Promise<void> => {
    await prisma.vehicle.delete({ where: { id } })
  },
}

// Employees
export const dbEmployeeService = {
  getAll: async (): Promise<Employee[]> => {
    return await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' },
    })
  },

  getById: async (id: string): Promise<Employee | null> => {
    return await prisma.employee.findUnique({ where: { id } })
  },

  create: async (data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> => {
    return await prisma.employee.create({ data })
  },

  update: async (id: string, data: Partial<Employee>): Promise<Employee> => {
    return await prisma.employee.update({ where: { id }, data })
  },

  delete: async (id: string): Promise<void> => {
    await prisma.employee.delete({ where: { id } })
  },
}

// Payslips
export const dbPayslipService = {
  getAll: async (): Promise<Payslip[]> => {
    return await prisma.payslip.findMany({
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    })
  },

  getById: async (id: string): Promise<Payslip | null> => {
    return await prisma.payslip.findUnique({
      where: { id },
      include: { employee: true },
    })
  },

  create: async (data: Omit<Payslip, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payslip> => {
    return await prisma.payslip.create({
      data,
      include: { employee: true },
    })
  },

  update: async (id: string, data: Partial<Payslip>): Promise<Payslip> => {
    return await prisma.payslip.update({
      where: { id },
      data,
      include: { employee: true },
    })
  },

  delete: async (id: string): Promise<void> => {
    await prisma.payslip.delete({ where: { id } })
  },
}
