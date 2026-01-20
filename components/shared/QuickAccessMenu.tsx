"use client"

import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Receipt,
  ShoppingCart,
  Users,
  Building2,
  Truck,
  UserCircle,
  CreditCard,
  Plus,
  TrendingUp,
} from "lucide-react"
import { useRouter } from "next/navigation"

const quickAccessItems = [
  { label: "New Quotation", href: "/quotations/new", icon: FileText },
  { label: "New Invoice", href: "/invoices/new", icon: Receipt },
  { label: "New Purchase Order", href: "/purchase-orders/new", icon: ShoppingCart },
  { label: "New Customer", href: "/customers/new", icon: Users },
  { label: "New Vendor", href: "/vendors/new", icon: Building2 },
  { label: "New Project", href: "/projects/new", icon: FileText },
  { label: "New Vehicle", href: "/vehicles/new", icon: Truck },
  { label: "New Employee", href: "/employees/new", icon: UserCircle },
  { label: "New Payslip", href: "/payslips/new", icon: CreditCard },
]

export function QuickAccessMenu() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-2 border-blue-200/60 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900"
        >
          <Plus className="mr-2 h-4 w-4" />
          Quick Access
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {quickAccessItems.map((item) => {
          const Icon = item.icon
          return (
            <DropdownMenuItem
              key={item.href}
              onClick={() => {
                router.push(item.href)
                setIsOpen(false)
              }}
              className="cursor-pointer"
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            router.push("/reports")
            setIsOpen(false)
          }}
          className="cursor-pointer"
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Reports & Analytics
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
