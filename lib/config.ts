// Company/Supplier Information Configuration
// Note: This is now managed through settings service
// Keeping this for backward compatibility
import { settingsService } from "./data/settings-service"

export const COMPANY_INFO = {
  get name() { return settingsService.get().companyName },
  get tradeLicense() { return settingsService.get().tradeLicense },
  get taxRegNumber() { return settingsService.get().taxRegNumber },
  get phone() { return settingsService.get().phone },
  get poBox() { return settingsService.get().poBox },
  get email() { return settingsService.get().email },
  get address() { return settingsService.get().address },
}

// Legacy export - use settingsService.get() instead
export const companyInfo = COMPANY_INFO
export const supplierInfo = COMPANY_INFO
