"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Receipt,
  Users,
  Building2,
  Truck,
  UserCircle,
  CreditCard,
  Menu,
  X,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface NavItem {
  name: string
  href: string
  icon: any
}

interface NavSection {
  title: string
  items: NavItem[]
}

import { TrendingUp } from "lucide-react"

const navigationSections: NavSection[] = [
  {
    title: "Orders",
    items: [
      { name: "Quotations", href: "/quotations", icon: FileText },
      { name: "Purchase Orders", href: "/purchase-orders", icon: ShoppingCart },
      { name: "Invoices", href: "/invoices", icon: Receipt },
      { name: "Receipts", href: "/receipts", icon: Receipt },
    ],
  },
  {
    title: "Human Resources",
    items: [
      { name: "Employees", href: "/employees", icon: UserCircle },
      { name: "Payslips", href: "/payslips", icon: CreditCard },
    ],
  },
  {
    title: "Management",
    items: [
      { name: "Customers", href: "/customers", icon: Users },
      { name: "Vendors", href: "/vendors", icon: Building2 },
      { name: "Projects", href: "/projects", icon: FileText },
      { name: "Vehicles", href: "/vehicles", icon: Truck },
      { name: "Reports", href: "/reports", icon: TrendingUp },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Orders: true,
    "Human Resources": true,
    Management: true,
  })

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  const isSectionActive = (items: NavItem[]) => {
    return items.some((item) => pathname === item.href)
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl transition-shadow"
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-blue-950 border-r-2 border-blue-200/60 dark:border-blue-800/60 shadow-lg transition-transform lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <div className="mb-8 mt-12 lg:mt-4 px-3">
            <div className="relative">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 via-blue-600 to-gold bg-clip-text text-transparent">
                ALMSAR ALZAKI
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mt-1">T&M CRM System</p>
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-gold to-blue-600 rounded-full"></div>
            </div>
          </div>
          <nav className="space-y-1">
            {/* Dashboard */}
            <Link
              href="/"
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center px-3 py-3 text-sm font-semibold rounded-xl transition-all duration-300 relative group mb-2",
                pathname === "/"
                  ? "bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-blue"
                  : "text-blue-900 dark:text-blue-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 dark:hover:from-blue-900 dark:hover:to-blue-800 hover:text-blue-800 dark:hover:text-blue-50"
              )}
            >
              <LayoutDashboard className="mr-3 h-5 w-5" />
              Dashboard
            </Link>

            {/* Navigation Sections */}
            {navigationSections.map((section) => {
              const isExpanded = expandedSections[section.title]
              const hasActiveItem = isSectionActive(section.items)
              
              return (
                <div key={section.title} className="mb-2">
                  <button
                    onClick={() => toggleSection(section.title)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider rounded-lg transition-colors hover:bg-blue-50 dark:hover:bg-blue-900",
                      hasActiveItem && "bg-blue-50 dark:bg-blue-900"
                    )}
                  >
                    <span>{section.title}</span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="mt-1 space-y-1 pl-2">
                      {section.items.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={cn(
                              "flex items-center px-3 py-2 text-sm font-semibold rounded-xl transition-all duration-300 relative group",
                              isActive
                                ? "bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-blue"
                                : "text-blue-900 dark:text-blue-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 dark:hover:from-blue-900 dark:hover:to-blue-800 hover:text-blue-800 dark:hover:text-blue-50"
                            )}
                          >
                            <Icon className="mr-3 h-5 w-5" />
                            {item.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Settings */}
            <Link
              href="/settings"
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center px-3 py-3 text-sm font-semibold rounded-xl transition-all duration-300 relative group mt-2",
                pathname === "/settings"
                  ? "bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-blue"
                  : "text-blue-900 dark:text-blue-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 dark:hover:from-blue-900 dark:hover:to-blue-800 hover:text-blue-800 dark:hover:text-blue-50"
              )}
            >
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </Link>
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}
