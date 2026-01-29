"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "./DateRangePicker"
import { Search, X, Filter } from "lucide-react"

interface SearchFilter {
  field: string
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between'
  value: string | number | [string, string]
}

interface AdvancedSearchProps {
  fields: Array<{ label: string; value: string; type: 'text' | 'number' | 'date' | 'select' }>
  onSearch: (filters: SearchFilter[]) => void
  onReset?: () => void
  selectOptions?: Record<string, Array<{ label: string; value: string }>>
}

export function AdvancedSearch({
  fields,
  onSearch,
  onReset,
  selectOptions = {},
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilter[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const addFilter = () => {
    setFilters([...filters, { field: fields[0]?.value || '', operator: 'contains', value: '' }])
  }

  const updateFilter = (index: number, updates: Partial<SearchFilter>) => {
    const newFilters = [...filters]
    newFilters[index] = { ...newFilters[index], ...updates }
    setFilters(newFilters)
  }

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index))
  }

  const handleSearch = () => {
    onSearch(filters.filter(f => f.value !== ''))
    setIsOpen(false)
  }

  const handleReset = () => {
    setFilters([])
    onReset?.()
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="border-2 border-blue-400 dark:border-blue-800/60"
      >
        <Filter className="mr-2 h-4 w-4" />
        Advanced Search
      </Button>
    )
  }

  return (
    <Card className="border-2 border-blue-400 dark:border-blue-800/60 shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <Search className="h-5 w-5 text-gold dark:text-yellow-400" />
            Advanced Search
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {filters.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No filters added. Click &quot;Add Filter&quot; to start.
          </p>
        )}

        {filters.map((filter, index) => {
          const field = fields.find(f => f.value === filter.field)
          const options = selectOptions[filter.field] || []

          return (
            <div key={index} className="grid gap-4 md:grid-cols-4 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Field</Label>
                <Select
                  value={filter.field}
                  onValueChange={(value) => updateFilter(index, { field: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Operator</Label>
                <Select
                  value={filter.operator}
                  onValueChange={(value: any) => updateFilter(index, { operator: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="greaterThan">Greater Than</SelectItem>
                    <SelectItem value="lessThan">Less Than</SelectItem>
                    <SelectItem value="between">Between</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Value</Label>
                {field?.type === 'select' && options.length > 0 ? (
                  <Select
                    value={String(filter.value)}
                    onValueChange={(value) => updateFilter(index, { value })}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field?.type === 'date' ? (
                  <Input
                    type="date"
                    value={String(filter.value)}
                    onChange={(e) => updateFilter(index, { value: e.target.value })}
                    className="h-10"
                  />
                ) : field?.type === 'number' ? (
                  <Input
                    type="number"
                    value={filter.value}
                    onChange={(e) => updateFilter(index, { value: parseFloat(e.target.value) || 0 })}
                    className="h-10"
                  />
                ) : (
                  <Input
                    type="text"
                    value={String(filter.value)}
                    onChange={(e) => updateFilter(index, { value: e.target.value })}
                    className="h-10"
                  />
                )}
              </div>

              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFilter(index)}
                  className="text-red-600 dark:text-red-400"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={addFilter}
            className="flex-1"
          >
            Add Filter
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSearch}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex-1"
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
