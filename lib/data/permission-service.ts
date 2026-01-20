import { Permission, UserRole, PermissionConfig, RolePermissions } from "@/types"

const STORAGE_KEY = 'permissionConfig'

// Default role permissions
const defaultRolePermissions: Record<UserRole, RolePermissions> = {
  admin: {
    role: 'admin',
    description: 'Full access to all features',
    permissions: [
      'edit_quotations',
      'edit_invoices',
      'edit_purchase_orders',
      'edit_receipts',
      'edit_customers',
      'edit_vendors',
      'edit_employees',
      'edit_payslips',
      'edit_vehicles',
      'edit_projects',
      'edit_settings',
      'delete_quotations',
      'delete_invoices',
      'delete_purchase_orders',
      'delete_customers',
      'delete_vendors',
      'delete_employees',
      'delete_payslips',
      'delete_vehicles',
      'delete_projects',
    ],
  },
  manager: {
    role: 'manager',
    description: 'Can edit most features except settings',
    permissions: [
      'edit_quotations',
      'edit_invoices',
      'edit_purchase_orders',
      'edit_receipts',
      'edit_customers',
      'edit_vendors',
      'edit_employees',
      'edit_payslips',
      'edit_vehicles',
      'edit_projects',
      'delete_quotations',
      'delete_invoices',
      'delete_purchase_orders',
      'delete_customers',
      'delete_vendors',
      'delete_employees',
      'delete_payslips',
      'delete_vehicles',
      'delete_projects',
    ],
  },
  user: {
    role: 'user',
    description: 'Can view and edit limited features',
    permissions: [
      'edit_quotations',
      'edit_invoices',
      'edit_customers',
      'edit_vendors',
      'edit_purchase_orders',
    ],
  },
  viewer: {
    role: 'viewer',
    description: 'Read-only access',
    permissions: [],
  },
}

// Load permission config from localStorage
function loadPermissionConfig(): PermissionConfig {
  if (typeof window === 'undefined') {
    return {
      currentRole: 'admin',
      roles: defaultRolePermissions,
    }
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      // Merge with defaults to ensure all roles exist
      return {
        ...parsed,
        roles: {
          ...defaultRolePermissions,
          ...parsed.roles,
        },
      }
    } catch (error) {
      console.error('Error loading permission config:', error)
    }
  }

  return {
    currentRole: 'admin',
    roles: defaultRolePermissions,
  }
}

// Save permission config to localStorage
function savePermissionConfig(config: PermissionConfig) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export const permissionService = {
  // Get current permission config
  getConfig: (): PermissionConfig => loadPermissionConfig(),

  // Get current role
  getCurrentRole: (): UserRole => {
    const config = loadPermissionConfig()
    return config.currentRole
  },

  // Set current role
  setCurrentRole: (role: UserRole): void => {
    const config = loadPermissionConfig()
    config.currentRole = role
    savePermissionConfig(config)
  },

  // Get permissions for current role
  getCurrentPermissions: (): Permission[] => {
    const config = loadPermissionConfig()
    const role = config.currentRole
    const rolePermissions = config.roles[role]?.permissions || []
    
    // Add custom permissions if any
    if (config.customPermissions) {
      return [...new Set([...rolePermissions, ...config.customPermissions])]
    }
    
    return rolePermissions
  },

  // Check if user has specific permission
  hasPermission: (permission: Permission): boolean => {
    const permissions = permissionService.getCurrentPermissions()
    return permissions.includes(permission)
  },

  // Get permissions for a specific role
  getRolePermissions: (role: UserRole): Permission[] => {
    const config = loadPermissionConfig()
    return config.roles[role]?.permissions || []
  },

  // Update permissions for a role
  updateRolePermissions: (role: UserRole, permissions: Permission[]): void => {
    const config = loadPermissionConfig()
    if (!config.roles[role]) {
      config.roles[role] = {
        role,
        description: defaultRolePermissions[role]?.description || '',
        permissions: [],
      }
    }
    config.roles[role].permissions = permissions
    savePermissionConfig(config)
  },

  // Update role description
  updateRoleDescription: (role: UserRole, description: string): void => {
    const config = loadPermissionConfig()
    if (!config.roles[role]) {
      config.roles[role] = {
        role,
        description,
        permissions: [],
      }
    } else {
      config.roles[role].description = description
    }
    savePermissionConfig(config)
  },

  // Set custom permissions (overrides role permissions)
  setCustomPermissions: (permissions: Permission[]): void => {
    const config = loadPermissionConfig()
    config.customPermissions = permissions
    savePermissionConfig(config)
  },

  // Get all available permissions
  getAllPermissions: (): Permission[] => {
    return [
      'edit_quotations',
      'edit_invoices',
      'edit_purchase_orders',
      'edit_receipts',
      'edit_customers',
      'edit_vendors',
      'edit_employees',
      'edit_payslips',
      'edit_vehicles',
      'edit_projects',
      'edit_settings',
      'delete_quotations',
      'delete_invoices',
      'delete_purchase_orders',
      'delete_customers',
      'delete_vendors',
      'delete_employees',
      'delete_payslips',
      'delete_vehicles',
      'delete_projects',
    ]
  },

  // Reset to default
  resetToDefaults: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
  },
}
