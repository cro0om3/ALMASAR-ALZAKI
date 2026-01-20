"use client"

import { useState, useEffect } from "react"
import { Permission, UserRole } from "@/types"
import { permissionService } from "@/lib/data/permission-service"

export function usePermissions() {
  const [currentRole, setCurrentRole] = useState<UserRole>('admin')
  const [permissions, setPermissions] = useState<Permission[]>([])

  useEffect(() => {
    const loadPermissions = () => {
      const role = permissionService.getCurrentRole()
      const perms = permissionService.getCurrentPermissions()
      setCurrentRole(role)
      setPermissions(perms)
    }

    loadPermissions()

    // Reload when storage changes (cross-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'permissionConfig') {
        loadPermissions()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission)
  }

  const canEdit = (entity: string): boolean => {
    return hasPermission(`edit_${entity}` as Permission)
  }

  const canDelete = (entity: string): boolean => {
    return hasPermission(`delete_${entity}` as Permission)
  }

  const updateRole = (role: UserRole) => {
    permissionService.setCurrentRole(role)
    setCurrentRole(role)
    setPermissions(permissionService.getCurrentPermissions())
  }

  return {
    currentRole,
    permissions,
    hasPermission,
    canEdit,
    canDelete,
    updateRole,
  }
}
