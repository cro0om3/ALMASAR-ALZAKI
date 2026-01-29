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
    default: 'border-blue-400 dark:border-blue-800/60 shadow-lg hover:shadow-xl bg-gradient-card backdrop-blur-sm',
    highlighted: 'border-gold/60 dark:border-gold/40 shadow-gold hover:shadow-xl bg-gradient-to-br from-gold/10 via-yellow-50/50 to-gold/5 dark:from-gold/20 dark:via-blue-900/30 dark:to-gold/10 backdrop-blur-sm',
    success: 'border-green-200/60 dark:border-green-800/60 shadow-lg hover:shadow-xl bg-gradient-to-br from-green-50/80 via-white to-green-50/50 dark:from-green-900/20 dark:via-blue-900/30 dark:to-green-900/10 backdrop-blur-sm',
    warning: 'border-yellow-200/60 dark:border-yellow-800/60 shadow-lg hover:shadow-xl bg-gradient-to-br from-yellow-50/80 via-white to-yellow-50/50 dark:from-yellow-900/20 dark:via-blue-900/30 dark:to-yellow-900/10 backdrop-blur-sm',
    danger: 'border-red-200/60 dark:border-red-800/60 shadow-lg hover:shadow-xl bg-gradient-to-br from-red-50/80 via-white to-red-50/50 dark:from-red-900/20 dark:via-blue-900/30 dark:to-red-900/10 backdrop-blur-sm',
  }

  return (
    <Card className={cn("border-2 transition-all duration-300", variantClasses[variant], className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2.5 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
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
