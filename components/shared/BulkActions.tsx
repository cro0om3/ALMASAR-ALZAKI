"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Download, Edit, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface BulkActionsProps<T> {
  items: T[]
  selectedItems: string[]
  onSelectionChange: (selected: string[]) => void
  onBulkDelete?: (ids: string[]) => void
  onBulkExport?: (items: T[]) => void
  onBulkEdit?: (ids: string[]) => void
  getItemId: (item: T) => string
  className?: string
}

export function BulkActions<T>({
  items,
  selectedItems,
  onSelectionChange,
  onBulkDelete,
  onBulkExport,
  onBulkEdit,
  getItemId,
  className,
}: BulkActionsProps<T>) {
  const [selectAll, setSelectAll] = useState(false)

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      onSelectionChange(items.map(getItemId))
    } else {
      onSelectionChange([])
    }
  }

  const handleItemSelect = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedItems, id])
    } else {
      onSelectionChange(selectedItems.filter(itemId => itemId !== id))
      setSelectAll(false)
    }
  }

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedItems.length > 0) {
      if (confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) {
        onBulkDelete(selectedItems)
        onSelectionChange([])
        setSelectAll(false)
      }
    }
  }

  const handleBulkExport = () => {
    if (onBulkExport) {
      const selectedItemsData = items.filter(item => selectedItems.includes(getItemId(item)))
      onBulkExport(selectedItemsData)
    }
  }

  const handleBulkEdit = () => {
    if (onBulkEdit && selectedItems.length > 0) {
      onBulkEdit(selectedItems)
    }
  }

  if (selectedItems.length === 0) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Checkbox
          checked={selectAll}
          onCheckedChange={handleSelectAll}
          id="select-all"
        />
        <label htmlFor="select-all" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
          Select All
        </label>
      </div>
    )
  }

  return (
    <Card className="border-2 border-blue-200/60 dark:border-blue-800/60 shadow-card bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              {selectedItems.length} item(s) selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onSelectionChange([])
                setSelectAll(false)
              }}
              className="text-xs"
            >
              Clear Selection
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {onBulkEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkEdit}
                className="border-blue-300 dark:border-blue-700"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            {onBulkExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkExport}
                className="border-green-300 dark:border-green-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            )}
            {onBulkDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
