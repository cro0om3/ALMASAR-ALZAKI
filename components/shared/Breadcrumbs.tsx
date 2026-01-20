"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn("flex items-center space-x-2 text-sm", className)}>
      <Link
        href="/"
        className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-600" />
          {item.href && index < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={cn(
                index === items.length - 1
                  ? "text-gray-900 dark:text-gray-100 font-medium"
                  : "text-gray-500 dark:text-gray-400"
              )}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
