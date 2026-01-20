/**
 * Helper function to apply permissions to list pages
 * This is a utility to quickly wrap edit/delete buttons with permission checks
 */

import { usePermissions } from "@/lib/hooks/use-permissions"

export function useEntityPermissions(entity: string) {
  const { canEdit, canDelete } = usePermissions()
  
  return {
    canEdit: () => canEdit(entity),
    canDelete: () => canDelete(entity),
    canCreate: () => canEdit(entity), // Creating requires edit permission
  }
}
