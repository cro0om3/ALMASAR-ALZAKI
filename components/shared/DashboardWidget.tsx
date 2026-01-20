"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface DashboardWidgetProps {
  title: string
  description?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
  variant?: 'default' | 'highlighted' | 'success' | 'warning' | 'danger'
  footer?: ReactNode
}

export function DashboardWidget({
  title,
  description,
  icon,
  children,
  className,
  variant = 'default',
  footer,
}: DashboardWidgetProps) {
  const variantClasses = {
    default: 'border-blue-200/60 dark:border-blue-800/60 shadow-card hover:shadow-card-hover bg-gradient-card',
    highlighted: 'border-gold/60 dark:border-gold/40 shadow-gold hover:shadow-lg bg-gradient-to-br from-gold/10 to-yellow-50 dark:from-gold/20 dark:to-blue-900/30',
    success: 'border-green-200/60 dark:border-green-800/60 shadow-card hover:shadow-card-hover bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-blue-900/30',
    warning: 'border-yellow-200/60 dark:border-yellow-800/60 shadow-card hover:shadow-card-hover bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/20 dark:to-blue-900/30',
    danger: 'border-red-200/60 dark:border-red-800/60 shadow-card hover:shadow-card-hover bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-blue-900/30',
  }

  return (
    <Card className={cn("border-2 transition-all duration-300", variantClasses[variant], className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white">
                {icon}
              </div>
            )}
            <div>
              <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100">
                {title}
              </CardTitle>
              {description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      {footer && (
        <div className="px-6 pb-6">
          {footer}
        </div>
      )}
    </Card>
  )
}
