"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Search, ArrowUpDown } from "lucide-react"
import { Pagination } from "./Pagination"
import { EmptyState } from "./EmptyState"

export interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchable?: boolean
  searchPlaceholder?: string
  searchKeys?: (keyof T)[]
  pagination?: boolean
  pageSize?: number
  emptyMessage?: string
  emptyDescription?: string
  onRowClick?: (item: T) => void
  actions?: (item: T) => React.ReactNode
  className?: string
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = "Search...",
  searchKeys,
  pagination = true,
  pageSize = 10,
  emptyMessage = "No data available",
  emptyDescription,
  onRowClick,
  actions,
  className,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Filter data
  const filteredData = data.filter((item) => {
    if (!searchTerm) return true

    const keysToSearch = searchKeys || (columns.map((c) => c.key) as (keyof T)[])
    return keysToSearch.some((key) => {
      const value = item[key]
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    })
  })

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0

    const aValue = a[sortKey]
    const bValue = b[sortKey]

    if (aValue === bValue) return 0

    const comparison = aValue < bValue ? -1 : 1
    return sortDirection === "asc" ? comparison : -comparison
  })

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = pagination
    ? sortedData.slice(startIndex, startIndex + pageSize)
    : sortedData

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page on search
  }

  if (data.length === 0 && !searchTerm) {
    return (
      <EmptyState
        title={emptyMessage}
        description={emptyDescription}
      />
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search */}
      {searchable && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchTerm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSearch("")}
            >
              Clear
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => {
                const isSortable = column.sortable !== false
                const isCurrentlySorted = sortKey === column.key

                return (
                  <TableHead
                    key={String(column.key)}
                    style={{ width: column.width }}
                    className={
                      isSortable
                        ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 select-none"
                        : ""
                    }
                    onClick={() =>
                      isSortable && handleSort(column.key as keyof T)
                    }
                  >
                    <div className="flex items-center gap-2">
                      {column.header}
                      {isSortable && (
                        <ArrowUpDown className="h-4 w-4 text-gray-400" />
                      )}
                      {isCurrentlySorted && (
                        <span className="text-xs">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                )
              })}
              {actions && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="text-center py-12"
                >
                  <EmptyState
                    title="No results found"
                    description="Try adjusting your search criteria"
                  />
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => (
                <TableRow
                  key={String(item.id)}
                  className={onRowClick ? "cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20" : ""}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <TableCell key={String(column.key)}>
                      {column.render
                        ? column.render(item)
                        : String(item[column.key as keyof T] || "-")}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {actions(item)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, sortedData.length)} of{" "}
            {sortedData.length} results
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {pagination && sortedData.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div>
            {sortedData.length} {sortedData.length === 1 ? "result" : "results"}
          </div>
          <div className="flex items-center gap-2">
            <span>Items per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setCurrentPage(1)
                // This would need to be handled by parent component
              }}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
