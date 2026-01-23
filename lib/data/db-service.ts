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
  Receipt,
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
    checkPrisma()
    return await prisma.customer.findUnique({ where: { id } })
  },

  create: async (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> => {
    checkPrisma()
    return await prisma.customer.create({ data })
  },

  update: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    checkPrisma()
    return await prisma.customer.update({ where: { id }, data })
  },

  delete: async (id: string): Promise<void> => {
    checkPrisma()
    await prisma.customer.delete({ where: { id } })
  },
}

// Vendors
export const dbVendorService = {
  getAll: async (): Promise<Vendor[]> => {
    checkPrisma()
    return await prisma.vendor.findMany({
      orderBy: { createdAt: 'desc' },
    })
  },

  getById: async (id: string): Promise<Vendor | null> => {
    checkPrisma()
    return await prisma.vendor.findUnique({ where: { id } })
  },

  create: async (data: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vendor> => {
    checkPrisma()
    return await prisma.vendor.create({ data })
  },

  update: async (id: string, data: Partial<Vendor>): Promise<Vendor> => {
    checkPrisma()
    return await prisma.vendor.update({ where: { id }, data })
  },

  delete: async (id: string): Promise<void> => {
    checkPrisma()
    await prisma.vendor.delete({ where: { id } })
  },
}

// Quotations
export const dbQuotationService = {
  getAll: async (): Promise<Quotation[]> => {
    checkPrisma()
    const quotations = await prisma.quotation.findMany({
      include: { customer: true, items: true },
      orderBy: { createdAt: 'desc' },
    })
    // Transform to match Quotation type
    return quotations.map((q: any) => ({
      ...q,
      date: q.date.toISOString(),
      validUntil: q.validUntil.toISOString(),
      createdAt: q.createdAt.toISOString(),
      updatedAt: q.updatedAt.toISOString(),
    })) as Quotation[]
  },

  getById: async (id: string): Promise<Quotation | null> => {
    checkPrisma()
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { customer: true, items: true },
    })
    if (!quotation) return null
    return {
      ...quotation,
      date: quotation.date.toISOString(),
      validUntil: quotation.validUntil.toISOString(),
      createdAt: quotation.createdAt.toISOString(),
      updatedAt: quotation.updatedAt.toISOString(),
    } as Quotation
  },

  create: async (data: any): Promise<Quotation> => {
    checkPrisma()
    const { items, ...quotationData } = data
    const quotation = await prisma.quotation.create({
      data: {
        ...quotationData,
        date: new Date(quotationData.date),
        validUntil: new Date(quotationData.validUntil),
        items: {
          create: items || [],
        },
      },
      include: { customer: true, items: true },
    })
    return {
      ...quotation,
      date: quotation.date.toISOString(),
      validUntil: quotation.validUntil.toISOString(),
      createdAt: quotation.createdAt.toISOString(),
      updatedAt: quotation.updatedAt.toISOString(),
    } as Quotation
  },

  update: async (id: string, data: any): Promise<Quotation> => {
    checkPrisma()
    const { items, ...quotationData } = data
    
    // Delete existing items and create new ones
    await prisma.quotationItem.deleteMany({ where: { quotationId: id } })
    
    const quotation = await prisma.quotation.update({
      where: { id },
      data: {
        ...quotationData,
        date: quotationData.date ? new Date(quotationData.date) : undefined,
        validUntil: quotationData.validUntil ? new Date(quotationData.validUntil) : undefined,
        items: {
          create: items || [],
        },
      },
      include: { customer: true, items: true },
    })
    return {
      ...quotation,
      date: quotation.date.toISOString(),
      validUntil: quotation.validUntil.toISOString(),
      createdAt: quotation.createdAt.toISOString(),
      updatedAt: quotation.updatedAt.toISOString(),
    } as Quotation
  },

  delete: async (id: string): Promise<void> => {
    checkPrisma()
    await prisma.quotation.delete({ where: { id } })
  },
}

// Invoices
export const dbInvoiceService = {
  getAll: async (): Promise<Invoice[]> => {
    checkPrisma()
    const invoices = await prisma.invoice.findMany({
      include: { customer: true, items: true, quotation: true },
      orderBy: { createdAt: 'desc' },
    })
    return invoices.map((inv: any) => ({
      ...inv,
      date: inv.date.toISOString(),
      dueDate: inv.dueDate.toISOString(),
      createdAt: inv.createdAt.toISOString(),
      updatedAt: inv.updatedAt.toISOString(),
    })) as Invoice[]
  },

  getById: async (id: string): Promise<Invoice | null> => {
    checkPrisma()
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { customer: true, items: true, quotation: true },
    })
    if (!invoice) return null
    return {
      ...invoice,
      date: invoice.date.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
    } as Invoice
  },

  create: async (data: any): Promise<Invoice> => {
    checkPrisma()
    const { items, ...invoiceData } = data
    const invoice = await prisma.invoice.create({
      data: {
        ...invoiceData,
        date: new Date(invoiceData.date),
        dueDate: new Date(invoiceData.dueDate),
        items: {
          create: items || [],
        },
      },
      include: { customer: true, items: true, quotation: true },
    })
    return {
      ...invoice,
      date: invoice.date.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
    } as Invoice
  },

  update: async (id: string, data: any): Promise<Invoice> => {
    checkPrisma()
    const { items, ...invoiceData } = data
    
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } })
    
    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...invoiceData,
        date: invoiceData.date ? new Date(invoiceData.date) : undefined,
        dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : undefined,
        items: {
          create: items || [],
        },
      },
      include: { customer: true, items: true, quotation: true },
    })
    return {
      ...invoice,
      date: invoice.date.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
    } as Invoice
  },

  delete: async (id: string): Promise<void> => {
    checkPrisma()
    await prisma.invoice.delete({ where: { id } })
  },
}

// Purchase Orders
export const dbPurchaseOrderService = {
  getAll: async (): Promise<PurchaseOrder[]> => {
    checkPrisma()
    const orders = await prisma.purchaseOrder.findMany({
      include: { vendor: true, items: true },
      orderBy: { createdAt: 'desc' },
    })
    return orders.map((po: any) => ({
      ...po,
      date: po.date.toISOString(),
      expectedDelivery: po.expectedDelivery.toISOString(),
      createdAt: po.createdAt.toISOString(),
      updatedAt: po.updatedAt.toISOString(),
    })) as PurchaseOrder[]
  },

  getById: async (id: string): Promise<PurchaseOrder | null> => {
    checkPrisma()
    const order = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { vendor: true, items: true },
    })
    if (!order) return null
    return {
      ...order,
      date: order.date.toISOString(),
      expectedDelivery: order.expectedDelivery.toISOString(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    } as PurchaseOrder
  },

  getByQuotationId: async (quotationId: string): Promise<PurchaseOrder[]> => {
    checkPrisma()
    // Note: PurchaseOrder doesn't have quotationId in schema, so this returns empty
    // You may need to add quotationId to PurchaseOrder model
    return []
  },

  getByCustomerId: async (customerId: string): Promise<PurchaseOrder[]> => {
    checkPrisma()
    // Note: PurchaseOrder doesn't have customerId in schema
    return []
  },

  create: async (data: any): Promise<PurchaseOrder> => {
    checkPrisma()
    const { items, ...orderData } = data
    const order = await prisma.purchaseOrder.create({
      data: {
        ...orderData,
        date: new Date(orderData.date),
        expectedDelivery: new Date(orderData.expectedDelivery),
        items: {
          create: items || [],
        },
      },
      include: { vendor: true, items: true },
    })
    return {
      ...order,
      date: order.date.toISOString(),
      expectedDelivery: order.expectedDelivery.toISOString(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    } as PurchaseOrder
  },

  update: async (id: string, data: any): Promise<PurchaseOrder> => {
    checkPrisma()
    const { items, ...orderData } = data
    
    await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } })
    
    const order = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        ...orderData,
        date: orderData.date ? new Date(orderData.date) : undefined,
        expectedDelivery: orderData.expectedDelivery ? new Date(orderData.expectedDelivery) : undefined,
        items: {
          create: items || [],
        },
      },
      include: { vendor: true, items: true },
    })
    return {
      ...order,
      date: order.date.toISOString(),
      expectedDelivery: order.expectedDelivery.toISOString(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    } as PurchaseOrder
  },

  delete: async (id: string): Promise<void> => {
    checkPrisma()
    await prisma.purchaseOrder.delete({ where: { id } })
  },
}

// Vehicles
export const dbVehicleService = {
  getAll: async (): Promise<Vehicle[]> => {
    checkPrisma()
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return vehicles.map((v: any) => ({
      ...v,
      purchaseDate: v.purchaseDate.toISOString(),
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    })) as Vehicle[]
  },

  getById: async (id: string): Promise<Vehicle | null> => {
    checkPrisma()
    const vehicle = await prisma.vehicle.findUnique({ where: { id } })
    if (!vehicle) return null
    return {
      ...vehicle,
      purchaseDate: vehicle.purchaseDate.toISOString(),
      createdAt: vehicle.createdAt.toISOString(),
      updatedAt: vehicle.updatedAt.toISOString(),
    } as Vehicle
  },

  create: async (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> => {
    checkPrisma()
    const vehicle = await prisma.vehicle.create({
      data: {
        ...data,
        purchaseDate: new Date(data.purchaseDate),
      },
    })
    return {
      ...vehicle,
      purchaseDate: vehicle.purchaseDate.toISOString(),
      createdAt: vehicle.createdAt.toISOString(),
      updatedAt: vehicle.updatedAt.toISOString(),
    } as Vehicle
  },

  update: async (id: string, data: Partial<Vehicle>): Promise<Vehicle> => {
    checkPrisma()
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        ...data,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
      },
    })
    return {
      ...vehicle,
      purchaseDate: vehicle.purchaseDate.toISOString(),
      createdAt: vehicle.createdAt.toISOString(),
      updatedAt: vehicle.updatedAt.toISOString(),
    } as Vehicle
  },

  delete: async (id: string): Promise<void> => {
    checkPrisma()
    await prisma.vehicle.delete({ where: { id } })
  },
}

// Employees
export const dbEmployeeService = {
  getAll: async (): Promise<Employee[]> => {
    checkPrisma()
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return employees.map((e: any) => ({
      ...e,
      hireDate: e.hireDate.toISOString(),
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    })) as Employee[]
  },

  getById: async (id: string): Promise<Employee | null> => {
    checkPrisma()
    const employee = await prisma.employee.findUnique({ where: { id } })
    if (!employee) return null
    return {
      ...employee,
      hireDate: employee.hireDate.toISOString(),
      createdAt: employee.createdAt.toISOString(),
      updatedAt: employee.updatedAt.toISOString(),
    } as Employee
  },

  create: async (data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> => {
    checkPrisma()
    const employee = await prisma.employee.create({
      data: {
        ...data,
        hireDate: new Date(data.hireDate),
      },
    })
    return {
      ...employee,
      hireDate: employee.hireDate.toISOString(),
      createdAt: employee.createdAt.toISOString(),
      updatedAt: employee.updatedAt.toISOString(),
    } as Employee
  },

  update: async (id: string, data: Partial<Employee>): Promise<Employee> => {
    checkPrisma()
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...data,
        hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
      },
    })
    return {
      ...employee,
      hireDate: employee.hireDate.toISOString(),
      createdAt: employee.createdAt.toISOString(),
      updatedAt: employee.updatedAt.toISOString(),
    } as Employee
  },

  delete: async (id: string): Promise<void> => {
    checkPrisma()
    await prisma.employee.delete({ where: { id } })
  },
}

// Payslips
export const dbPayslipService = {
  getAll: async (): Promise<Payslip[]> => {
    checkPrisma()
    const payslips = await prisma.payslip.findMany({
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    })
    return payslips.map((p: any) => ({
      ...p,
      payPeriodStart: p.payPeriodStart.toISOString(),
      payPeriodEnd: p.payPeriodEnd.toISOString(),
      issueDate: p.issueDate.toISOString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })) as Payslip[]
  },

  getById: async (id: string): Promise<Payslip | null> => {
    checkPrisma()
    const payslip = await prisma.payslip.findUnique({
      where: { id },
      include: { employee: true },
    })
    if (!payslip) return null
    return {
      ...payslip,
      payPeriodStart: payslip.payPeriodStart.toISOString(),
      payPeriodEnd: payslip.payPeriodEnd.toISOString(),
      issueDate: payslip.issueDate.toISOString(),
      createdAt: payslip.createdAt.toISOString(),
      updatedAt: payslip.updatedAt.toISOString(),
    } as Payslip
  },

  getByEmployeeId: async (employeeId: string): Promise<Payslip[]> => {
    checkPrisma()
    const payslips = await prisma.payslip.findMany({
      where: { employeeId },
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    })
    return payslips.map((p: any) => ({
      ...p,
      payPeriodStart: p.payPeriodStart.toISOString(),
      payPeriodEnd: p.payPeriodEnd.toISOString(),
      issueDate: p.issueDate.toISOString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })) as Payslip[]
  },

  create: async (data: Omit<Payslip, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payslip> => {
    checkPrisma()
    const payslip = await prisma.payslip.create({
      data: {
        ...data,
        payPeriodStart: new Date(data.payPeriodStart),
        payPeriodEnd: new Date(data.payPeriodEnd),
        issueDate: new Date(data.issueDate),
      },
      include: { employee: true },
    })
    return {
      ...payslip,
      payPeriodStart: payslip.payPeriodStart.toISOString(),
      payPeriodEnd: payslip.payPeriodEnd.toISOString(),
      issueDate: payslip.issueDate.toISOString(),
      createdAt: payslip.createdAt.toISOString(),
      updatedAt: payslip.updatedAt.toISOString(),
    } as Payslip
  },

  update: async (id: string, data: Partial<Payslip>): Promise<Payslip> => {
    checkPrisma()
    const payslip = await prisma.payslip.update({
      where: { id },
      data: {
        ...data,
        payPeriodStart: data.payPeriodStart ? new Date(data.payPeriodStart) : undefined,
        payPeriodEnd: data.payPeriodEnd ? new Date(data.payPeriodEnd) : undefined,
        issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
      },
      include: { employee: true },
    })
    return {
      ...payslip,
      payPeriodStart: payslip.payPeriodStart.toISOString(),
      payPeriodEnd: payslip.payPeriodEnd.toISOString(),
      issueDate: payslip.issueDate.toISOString(),
      createdAt: payslip.createdAt.toISOString(),
      updatedAt: payslip.updatedAt.toISOString(),
    } as Payslip
  },

  delete: async (id: string): Promise<void> => {
    checkPrisma()
    await prisma.payslip.delete({ where: { id } })
  },
}

// Receipts
export const dbReceiptService = {
  getAll: async (): Promise<Receipt[]> => {
    checkPrisma()
    const receipts = await prisma.receipt.findMany({
      include: { invoice: true, customer: true },
      orderBy: { createdAt: 'desc' },
    })
    return receipts.map((r: any) => ({
      ...r,
      date: r.date.toISOString(),
      paymentDate: r.paymentDate.toISOString(),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })) as Receipt[]
  },

  getById: async (id: string): Promise<Receipt | null> => {
    checkPrisma()
    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: { invoice: true, customer: true },
    })
    if (!receipt) return null
    return {
      ...receipt,
      date: receipt.date.toISOString(),
      paymentDate: receipt.paymentDate.toISOString(),
      createdAt: receipt.createdAt.toISOString(),
      updatedAt: receipt.updatedAt.toISOString(),
    } as Receipt
  },

  getByInvoiceId: async (invoiceId: string): Promise<Receipt[]> => {
    checkPrisma()
    const receipts = await prisma.receipt.findMany({
      where: { invoiceId },
      include: { invoice: true, customer: true },
      orderBy: { createdAt: 'desc' },
    })
    return receipts.map((r: any) => ({
      ...r,
      date: r.date.toISOString(),
      paymentDate: r.paymentDate.toISOString(),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })) as Receipt[]
  },

  create: async (data: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>): Promise<Receipt> => {
    checkPrisma()
    const receipt = await prisma.receipt.create({
      data: {
        ...data,
        date: new Date(data.date),
        paymentDate: new Date(data.paymentDate),
      },
      include: { invoice: true, customer: true },
    })
    return {
      ...receipt,
      date: receipt.date.toISOString(),
      paymentDate: receipt.paymentDate.toISOString(),
      createdAt: receipt.createdAt.toISOString(),
      updatedAt: receipt.updatedAt.toISOString(),
    } as Receipt
  },

  update: async (id: string, data: Partial<Receipt>): Promise<Receipt> => {
    checkPrisma()
    const receipt = await prisma.receipt.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : undefined,
      },
      include: { invoice: true, customer: true },
    })
    return {
      ...receipt,
      date: receipt.date.toISOString(),
      paymentDate: receipt.paymentDate.toISOString(),
      createdAt: receipt.createdAt.toISOString(),
      updatedAt: receipt.updatedAt.toISOString(),
    } as Receipt
  },

  delete: async (id: string): Promise<void> => {
    checkPrisma()
    await prisma.receipt.delete({ where: { id } })
  },
}
