import { Project, UsageEntry, MonthlyInvoice, BillingType } from "@/types/project"

// In-memory storage
let projects: Project[] = []
let usageEntries: UsageEntry[] = []
let monthlyInvoices: MonthlyInvoice[] = []

// Initialize from localStorage
if (typeof window !== 'undefined') {
  const loadFromStorage = () => {
    try {
      projects = JSON.parse(localStorage.getItem('projects') || '[]')
      usageEntries = JSON.parse(localStorage.getItem('usageEntries') || '[]')
      monthlyInvoices = JSON.parse(localStorage.getItem('monthlyInvoices') || '[]')
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

// Projects Service
export const projectService = {
  getAll: (): Project[] => projects,
  
  getById: (id: string): Project | undefined => 
    projects.find(p => p.id === id),
  
  getByQuotationId: (quotationId: string): Project | undefined =>
    projects.find(p => p.quotationId === quotationId),
  
  getByCustomerId: (customerId: string): Project[] =>
    projects.filter(p => p.customerId === customerId),
  
  create: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project => {
    const newProject: Project = {
      ...project,
      id: `PROJ-${Date.now()}`,
      projectNumber: project.projectNumber || `PRJ-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    projects.push(newProject)
    saveToStorage('projects', projects)
    return newProject
  },
  
  update: (id: string, updates: Partial<Project>): Project | null => {
    const index = projects.findIndex(p => p.id === id)
    if (index === -1) return null
    projects[index] = { 
      ...projects[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    }
    saveToStorage('projects', projects)
    return projects[index]
  },
  
  delete: (id: string): boolean => {
    const index = projects.findIndex(p => p.id === id)
    if (index === -1) return false
    projects.splice(index, 1)
    saveToStorage('projects', projects)
    return true
  },
  
  // تحديث حالة المشروع عند استلام PO
  markPOReceived: (id: string, poNumber: string, poDate: string): Project | null => {
    return projectService.update(id, {
      poReceived: true,
      poNumber,
      poDate,
      status: 'po_received'
    })
  },
  
  // تعيين مركبات للمشروع
  assignVehicles: (id: string, vehicleIds: string[]): Project | null => {
    return projectService.update(id, {
      assignedVehicles: vehicleIds,
      status: 'active'
    })
  },
}

// Usage Tracking Service
export const usageService = {
  getAll: (): UsageEntry[] => usageEntries,
  
  getById: (id: string): UsageEntry | undefined =>
    usageEntries.find(u => u.id === id),
  
  getByProjectId: (projectId: string): UsageEntry[] =>
    usageEntries.filter(u => u.projectId === projectId),
  
  getByProjectAndMonth: (projectId: string, month: number, year: number): UsageEntry[] => {
    return usageEntries.filter(u => {
      if (u.projectId !== projectId) return false
      if (u.invoiced) return false // لا نعيد استخدامات مفوترة
      
      const entryDate = new Date(u.date)
      return entryDate.getMonth() + 1 === month && entryDate.getFullYear() === year
    })
  },
  
  create: (entry: Omit<UsageEntry, 'id' | 'createdAt' | 'updatedAt' | 'total' | 'invoiced'>): UsageEntry => {
    // حساب الإجمالي
    const project = projectService.getById(entry.projectId)
    let total = 0
    let rate = entry.rate
    
    if (project) {
      if (project.billingType === 'hours' && entry.hours) {
        rate = project.hourlyRate || entry.rate
        total = entry.hours * rate
      } else if (project.billingType === 'days' && entry.days) {
        rate = project.dailyRate || entry.rate
        total = entry.days * rate
      }
    }
    
    const newEntry: UsageEntry = {
      ...entry,
      id: `USE-${Date.now()}`,
      rate,
      total,
      invoiced: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    usageEntries.push(newEntry)
    saveToStorage('usageEntries', usageEntries)
    return newEntry
  },
  
  update: (id: string, updates: Partial<UsageEntry>): UsageEntry | null => {
    const index = usageEntries.findIndex(u => u.id === id)
    if (index === -1) return null
    
    // إعادة حساب الإجمالي إذا تغيرت الساعات/الأيام
    if (updates.hours || updates.days || updates.rate) {
      const entry = usageEntries[index]
      const project = projectService.getById(entry.projectId)
      let total = 0
      let rate = updates.rate || entry.rate
      
      if (project) {
        if (project.billingType === 'hours') {
          const hours = updates.hours !== undefined ? updates.hours : entry.hours || 0
          rate = project.hourlyRate || rate
          total = hours * rate
        } else if (project.billingType === 'days') {
          const days = updates.days !== undefined ? updates.days : entry.days || 0
          rate = project.dailyRate || rate
          total = days * rate
        }
      }
      
      updates.total = total
      updates.rate = rate
    }
    
    usageEntries[index] = { 
      ...usageEntries[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    }
    saveToStorage('usageEntries', usageEntries)
    return usageEntries[index]
  },
  
  delete: (id: string): boolean => {
    const index = usageEntries.findIndex(u => u.id === id)
    if (index === -1) return false
    usageEntries.splice(index, 1)
    saveToStorage('usageEntries', usageEntries)
    return true
  },
  
  // تحديد الاستخدامات كمفوترة
  markAsInvoiced: (ids: string[], invoiceId: string): void => {
    ids.forEach(id => {
      const index = usageEntries.findIndex(u => u.id === id)
      if (index !== -1) {
        usageEntries[index].invoiced = true
        usageEntries[index].invoiceId = invoiceId
        usageEntries[index].updatedAt = new Date().toISOString()
      }
    })
    saveToStorage('usageEntries', usageEntries)
  },
}

// Monthly Invoice Service
export const monthlyInvoiceService = {
  getAll: (): MonthlyInvoice[] => monthlyInvoices,
  
  getById: (id: string): MonthlyInvoice | undefined =>
    monthlyInvoices.find(i => i.id === id),
  
  getByProjectId: (projectId: string): MonthlyInvoice[] =>
    monthlyInvoices.filter(i => i.projectId === projectId),
  
  // إنشاء فاتورة شهرية تلقائياً
  generateMonthlyInvoice: (
    projectId: string, 
    month: number, 
    year: number,
    taxRate: number = 0
  ): MonthlyInvoice | null => {
    const project = projectService.getById(projectId)
    if (!project) return null
    
    // الحصول على الاستخدامات غير المفوترة للشهر
    const usageEntries = usageService.getByProjectAndMonth(projectId, month, year)
    if (usageEntries.length === 0) return null
    
    // حساب الإجماليات
    let totalHours = 0
    let totalDays = 0
    let subtotal = 0
    
    usageEntries.forEach(entry => {
      if (entry.hours) totalHours += entry.hours
      if (entry.days) totalDays += entry.days
      subtotal += entry.total
    })
    
    const taxAmount = (subtotal * taxRate) / 100
    const total = subtotal + taxAmount
    
    // استيراد ديناميكي لتجنب circular dependency
    const { vehicleService, invoiceService } = require('./index')
    
    // إنشاء عناصر الفاتورة من الاستخدامات
    const invoiceItems = usageEntries.map(entry => {
      const vehicle = vehicleService.getById(entry.vehicleId)
      const description = `${entry.description}${vehicle ? ` - ${vehicle.make} ${vehicle.model}` : ''}${entry.location ? ` (${entry.location})` : ''}`
      
      return {
        id: `item-${entry.id}`,
        description,
        quantity: entry.hours || entry.days || 1,
        unitPrice: entry.rate,
        tax: 0,
        total: entry.total,
        hours: entry.hours,
        days: entry.days,
        billingType: project.billingType,
      }
    })
    
    // إنشاء فاتورة في نظام الفواتير العادي
    const regularInvoice = invoiceService.create({
      invoiceNumber: `INV-${year}-${month.toString().padStart(2, '0')}-${project.projectNumber}`,
      quotationId: project.quotationId,
      customerId: project.customerId,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(year, month, 0).toISOString().split('T')[0],
      items: invoiceItems,
      subtotal,
      taxRate,
      taxAmount,
      total,
      paidAmount: 0,
      status: 'draft',
      terms: project.terms || '',
      notes: `فاتورة شهرية - ${month}/${year} - ${project.title}`,
    })
    
    // إنشاء الفاتورة الشهرية
    const invoice: MonthlyInvoice = {
      id: `MINV-${Date.now()}`,
      invoiceNumber: regularInvoice.invoiceNumber,
      projectId,
      customerId: project.customerId,
      month,
      year,
      usageEntries: usageEntries.map(e => e.id),
      totalHours: project.billingType === 'hours' ? totalHours : undefined,
      totalDays: project.billingType === 'days' ? totalDays : undefined,
      subtotal,
      taxRate,
      taxAmount,
      total,
      status: 'draft',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(year, month, 0).toISOString().split('T')[0],
      paidAmount: 0,
      notes: `فاتورة شهرية - ${month}/${year}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    monthlyInvoices.push(invoice)
    saveToStorage('monthlyInvoices', monthlyInvoices)
    
    // تحديد الاستخدامات كمفوترة
    usageService.markAsInvoiced(usageEntries.map(e => e.id), regularInvoice.id)
    
    return invoice
  },
  
  update: (id: string, updates: Partial<MonthlyInvoice>): MonthlyInvoice | null => {
    const index = monthlyInvoices.findIndex(i => i.id === id)
    if (index === -1) return null
    monthlyInvoices[index] = { 
      ...monthlyInvoices[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    }
    saveToStorage('monthlyInvoices', monthlyInvoices)
    return monthlyInvoices[index]
  },
  
  delete: (id: string): boolean => {
    const index = monthlyInvoices.findIndex(i => i.id === id)
    if (index === -1) return false
    monthlyInvoices.splice(index, 1)
    saveToStorage('monthlyInvoices', monthlyInvoices)
    return true
  },
}
