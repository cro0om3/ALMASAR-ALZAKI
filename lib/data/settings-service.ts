// Settings Service - Stores all application settings

export interface AppSettings {
  // Number Prefixes
  quotationPrefix: string
  invoicePrefix: string
  receiptPrefix: string
  
  // Company Information
  companyName: string
  tradeLicense: string
  taxRegNumber: string
  phone: string
  poBox: string
  email: string
  address: string
  
  // Logo
  logoUrl?: string // Base64 encoded image or URL
  
  // Invoice/Quotation Settings
  defaultVATRate: number
  currency: string
  currencySymbol: string
  
  // Other Settings
  invoiceTerms: string
  quotationTerms: string
  footerText?: string
  
  // System Settings
  dateFormat?: string
  timeFormat?: '12h' | '24h'
  language?: string
  notificationsEnabled?: boolean
  emailNotifications?: boolean
  autoSave?: boolean
  itemsPerPage?: number
  
  // AI Settings
  aiEnabled?: boolean
  openAIApiKey?: string
  
  updatedAt: string
}

const defaultSettings: AppSettings = {
  quotationPrefix: "QT",
  invoicePrefix: "INV",
  receiptPrefix: "RCP",
  companyName: "ALMSAR ALZAKI Transport & Maintenance",
  tradeLicense: "CN-5570900",
  taxRegNumber: "TRN: 105061702400003",
  phone: "+971543114444",
  poBox: "133615",
  email: "almsar.uae@gmail.com",
  address: "Musaffah - Abu Dhabi United Arab Emirates",
  defaultVATRate: 5,
  currency: "AED",
  currencySymbol: "AED",
  invoiceTerms: "Payment due within 30 days",
  quotationTerms: "Valid for 30 days",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  language: "en",
  notificationsEnabled: true,
  emailNotifications: false,
  autoSave: true,
  itemsPerPage: 25,
  aiEnabled: false,
  openAIApiKey: '',
  updatedAt: new Date().toISOString(),
}

let settings: AppSettings = defaultSettings

// Load settings from localStorage
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem('appSettings')
    if (stored) {
      settings = { ...defaultSettings, ...JSON.parse(stored) }
    } else {
      settings = defaultSettings
      localStorage.setItem('appSettings', JSON.stringify(settings))
    }
  } catch (error) {
    console.error('Error loading settings:', error)
    settings = defaultSettings
  }
}

export const settingsService = {
  get: (): AppSettings => {
    return { ...settings }
  },
  
  update: (updates: Partial<AppSettings>): AppSettings => {
    settings = {
      ...settings,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('appSettings', JSON.stringify(settings))
    }
    return settings
  },
  
  reset: (): AppSettings => {
    settings = defaultSettings
    if (typeof window !== 'undefined') {
      localStorage.setItem('appSettings', JSON.stringify(settings))
    }
    return settings
  },
  
  // Generate number with prefix
  generateQuotationNumber: (): string => {
    const year = new Date().getFullYear()
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0')
    const timestamp = Date.now().toString().slice(-6)
    return `${settings.quotationPrefix}-${year}-${month}-${timestamp}`
  },
  
  generateInvoiceNumber: (): string => {
    const year = new Date().getFullYear()
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0')
    const timestamp = Date.now().toString().slice(-6)
    return `${settings.invoicePrefix}-${year}-${month}-${timestamp}`
  },
  
  generateReceiptNumber: (): string => {
    const year = new Date().getFullYear()
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0')
    const timestamp = Date.now().toString().slice(-6)
    return `${settings.receiptPrefix}-${year}-${month}-${timestamp}`
  },
}
