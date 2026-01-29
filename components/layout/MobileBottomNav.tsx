"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Receipt,
  Users,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"

const mobileNav = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Quotations", href: "/quotations", icon: FileText },
  { name: "Invoices", href: "/invoices", icon: Receipt },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "More", href: "/menu", icon: Menu },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-blue-950 border-t border-blue-400 dark:border-blue-800 shadow-lg z-50">
      <div className="flex justify-around items-center h-16">
        {mobileNav.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                isActive
                  ? "text-blue-600 dark:text-yellow-400 bg-blue-50 dark:bg-blue-900"
                  : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400"
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
