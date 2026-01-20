"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      {Icon && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-full">
          <Icon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
        </div>
      )}
      <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
          {description}
        </p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          variant="gold"
          className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-gold"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
