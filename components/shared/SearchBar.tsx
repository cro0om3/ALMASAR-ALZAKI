"use client"

import { useState, useEffect, useRef } from "react"
import { Search, FileText, Receipt, ShoppingCart, Users, Building2, Truck, UserCircle, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { quotationService, invoiceService, purchaseOrderService, customerService, vendorService, employeeService, projectService } from "@/lib/data"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: string
  type: 'quotation' | 'invoice' | 'purchase_order' | 'receipt' | 'customer' | 'vendor' | 'employee' | 'project'
  title: string
  subtitle: string
  number?: string
  link: string
  icon: any
}

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
      
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setQuery("")
      }

      // Arrow keys navigation
      if (isOpen && results.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
        } else if (e.key === 'Enter') {
          e.preventDefault()
          if (results[selectedIndex]) {
            handleSelectResult(results[selectedIndex])
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const searchTerm = query.toLowerCase()
    const searchResults: SearchResult[] = []

    // Search Quotations
    quotationService.getAll().forEach((q) => {
      if (
        q.quotationNumber.toLowerCase().includes(searchTerm) ||
        q.customerId.toLowerCase().includes(searchTerm)
      ) {
        const customer = customerService.getById(q.customerId)
        searchResults.push({
          id: q.id,
          type: 'quotation',
          title: q.quotationNumber,
          subtitle: customer?.name || 'Unknown Customer',
          number: q.quotationNumber,
          link: `/quotations/${q.id}`,
          icon: FileText,
        })
      }
    })

    // Search Invoices
    invoiceService.getAll().forEach((inv) => {
      if (
        inv.invoiceNumber.toLowerCase().includes(searchTerm) ||
        inv.customerId.toLowerCase().includes(searchTerm)
      ) {
        const customer = customerService.getById(inv.customerId)
        searchResults.push({
          id: inv.id,
          type: 'invoice',
          title: inv.invoiceNumber,
          subtitle: customer?.name || 'Unknown Customer',
          number: inv.invoiceNumber,
          link: `/invoices/${inv.id}`,
          icon: Receipt,
        })
      }
    })

    // Search Purchase Orders
    purchaseOrderService.getAll().forEach((po) => {
      if (
        po.orderNumber.toLowerCase().includes(searchTerm) ||
        (po.vendorId && po.vendorId.toLowerCase().includes(searchTerm)) ||
        (po.customerId && po.customerId.toLowerCase().includes(searchTerm))
      ) {
        const vendor = po.vendorId ? vendorService.getById(po.vendorId) : null
        const customer = po.customerId ? customerService.getById(po.customerId) : null
        searchResults.push({
          id: po.id,
          type: 'purchase_order',
          title: po.orderNumber,
          subtitle: vendor?.name || customer?.name || 'Unknown',
          number: po.orderNumber,
          link: `/purchase-orders/${po.id}`,
          icon: ShoppingCart,
        })
      }
    })

    // Search Customers
    customerService.getAll().forEach((customer) => {
      if (
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm) ||
        customer.phone?.toLowerCase().includes(searchTerm)
      ) {
        searchResults.push({
          id: customer.id,
          type: 'customer',
          title: customer.name,
          subtitle: customer.email || customer.phone || 'No contact info',
          link: `/customers/${customer.id}`,
          icon: Users,
        })
      }
    })

    // Search Vendors
    vendorService.getAll().forEach((vendor) => {
      if (
        vendor.name.toLowerCase().includes(searchTerm) ||
        vendor.email?.toLowerCase().includes(searchTerm) ||
        vendor.phone?.toLowerCase().includes(searchTerm)
      ) {
        searchResults.push({
          id: vendor.id,
          type: 'vendor',
          title: vendor.name,
          subtitle: vendor.email || vendor.phone || 'No contact info',
          link: `/vendors/${vendor.id}`,
          icon: Building2,
        })
      }
    })

    // Search Employees
    employeeService.getAll().forEach((employee) => {
      const fullName = `${employee.firstName} ${employee.lastName}`
      if (
        fullName.toLowerCase().includes(searchTerm) ||
        employee.email?.toLowerCase().includes(searchTerm) ||
        employee.phone?.toLowerCase().includes(searchTerm)
      ) {
        searchResults.push({
          id: employee.id,
          type: 'employee',
          title: fullName,
          subtitle: employee.email || employee.phone || 'No contact info',
          link: `/employees/${employee.id}`,
          icon: UserCircle,
        })
      }
    })

    // Search Projects
    if (projectService && projectService.getAll) {
      projectService.getAll().forEach((project: any) => {
        if (
          project.name?.toLowerCase().includes(searchTerm) ||
          project.projectNumber?.toLowerCase().includes(searchTerm)
        ) {
          searchResults.push({
            id: project.id,
            type: 'project',
            title: project.name,
            subtitle: project.projectNumber || 'No project number',
            number: project.projectNumber,
            link: `/projects/${project.id}`,
            icon: FileText,
          })
        }
      })
    }

    setResults(searchResults.slice(0, 8))
    setSelectedIndex(0)
  }, [query])

  const handleSelectResult = (result: SearchResult) => {
    router.push(result.link)
    setIsOpen(false)
    setQuery("")
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quotation':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'invoice':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
      case 'purchase_order':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      case 'customer':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
      case 'vendor':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
      case 'employee':
        return 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-blue-900/50 text-sm text-gray-500 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-600 transition-colors w-full max-w-md"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="ml-auto hidden xl:inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-1.5 font-mono text-[10px] font-medium text-gray-500 dark:text-gray-400">
          ⌘K
        </kbd>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4" onClick={() => setIsOpen(false)}>
      <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <Card className="border-2 border-blue-300 dark:border-blue-700 shadow-2xl bg-white dark:bg-blue-950">
          <div className="flex items-center gap-2 p-4 border-b border-blue-200 dark:border-blue-800">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search quotations, invoices, customers, vendors..."
              className="border-0 focus-visible:ring-0 text-lg bg-transparent"
              autoFocus
            />
            <button
              onClick={() => {
                setIsOpen(false)
                setQuery("")
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-blue-900 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {results.length > 0 && (
            <div ref={resultsRef} className="max-h-[400px] overflow-y-auto p-2">
              {results.map((result, index) => {
                const Icon = result.icon
                return (
                  <div
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelectResult(result)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                      index === selectedIndex
                        ? "bg-blue-100 dark:bg-blue-900"
                        : "hover:bg-gray-50 dark:hover:bg-blue-900/50"
                    )}
                  >
                    <div className={cn("p-2 rounded-lg", getTypeColor(result.type))}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-blue-900 dark:text-blue-100 truncate">
                        {result.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {result.subtitle}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {result.type.replace('_', ' ')}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
          {query.length >= 2 && results.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No results found for "{query}"
            </div>
          )}
          {query.length < 2 && (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
              Start typing to search...
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
