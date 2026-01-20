"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  FileText, Receipt, ShoppingCart, Users, Building2, 
  Truck, UserCircle, CreditCard, X, Plus 
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface QuickAction {
  id: string
  label: string
  icon: any
  href: string
  color: string
}

const quickActions: QuickAction[] = [
  { id: 'quotation', label: 'New Quotation', icon: FileText, href: '/quotations/new', color: 'blue' },
  { id: 'invoice', label: 'New Invoice', icon: Receipt, href: '/invoices/new', color: 'yellow' },
  { id: 'purchase-order', label: 'New Purchase Order', icon: ShoppingCart, href: '/purchase-orders/new', color: 'green' },
  { id: 'customer', label: 'Add Customer', icon: Users, href: '/customers/new', color: 'purple' },
  { id: 'vendor', label: 'Add Vendor', icon: Building2, href: '/vendors/new', color: 'orange' },
  { id: 'employee', label: 'Add Employee', icon: UserCircle, href: '/employees/new', color: 'pink' },
  { id: 'vehicle', label: 'Add Vehicle', icon: Truck, href: '/vehicles/new', color: 'blue' },
  { id: 'payslip', label: 'Create Payslip', icon: CreditCard, href: '/payslips/new', color: 'green' },
]

export function QuickActions() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + K to open quick actions
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'K') {
        e.preventDefault()
        setIsOpen(true)
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setSearchQuery("")
      }

      // Arrow keys navigation
      if (isOpen) {
        const filtered = quickActions.filter(action =>
          action.label.toLowerCase().includes(searchQuery.toLowerCase())
        )

        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : prev))
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
        } else if (e.key === 'Enter') {
          e.preventDefault()
          if (filtered[selectedIndex]) {
            router.push(filtered[selectedIndex].href)
            setIsOpen(false)
            setSearchQuery("")
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, searchQuery, selectedIndex, router])

  const filteredActions = quickActions.filter(action =>
    action.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isOpen) {
    return null
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4 bg-black/50"
      onClick={() => {
        setIsOpen(false)
        setSearchQuery("")
      }}
    >
      <Card 
        className="w-full max-w-2xl border-2 border-blue-300 dark:border-blue-700 shadow-2xl bg-white dark:bg-blue-950"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="border-b border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">
              Quick Actions
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsOpen(false)
                setSearchQuery("")
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Input
            placeholder="Search actions..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setSelectedIndex(0)
            }}
            className="mt-4"
            autoFocus
          />
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {filteredActions.map((action, index) => {
              const Icon = action.icon
              const isSelected = index === selectedIndex
              
              return (
                <button
                  key={action.id}
                  onClick={() => {
                    router.push(action.href)
                    setIsOpen(false)
                    setSearchQuery("")
                  }}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                    isSelected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/50"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-blue-900/30"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-lg",
                    action.color === 'blue' && "bg-blue-100 dark:bg-blue-900",
                    action.color === 'yellow' && "bg-yellow-100 dark:bg-yellow-900",
                    action.color === 'green' && "bg-green-100 dark:bg-green-900",
                    action.color === 'purple' && "bg-purple-100 dark:bg-purple-900",
                    action.color === 'orange' && "bg-orange-100 dark:bg-orange-900",
                    action.color === 'pink' && "bg-pink-100 dark:bg-pink-900",
                  )}>
                    <Icon className={cn(
                      "h-5 w-5",
                      action.color === 'blue' && "text-blue-600 dark:text-blue-400",
                      action.color === 'yellow' && "text-yellow-600 dark:text-yellow-400",
                      action.color === 'green' && "text-green-600 dark:text-green-400",
                      action.color === 'purple' && "text-purple-600 dark:text-purple-400",
                      action.color === 'orange' && "text-orange-600 dark:text-orange-400",
                      action.color === 'pink' && "text-pink-600 dark:text-pink-400",
                    )} />
                  </div>
                  <span className="text-xs font-semibold text-center text-blue-900 dark:text-blue-100">
                    {action.label}
                  </span>
                </button>
              )
            })}
          </div>
          {filteredActions.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No actions found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
