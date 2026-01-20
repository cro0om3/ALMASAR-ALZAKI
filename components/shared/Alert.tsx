"use client"

import { AlertTriangle, CheckCircle2, Info, X, AlertCircle as AlertCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AlertProps {
  title?: string
  description?: string
  variant?: "default" | "success" | "warning" | "error" | "info"
  onClose?: () => void
  className?: string
  children?: React.ReactNode
}

export function Alert({
  title,
  description,
  variant = "default",
  onClose,
  className,
  children,
}: AlertProps) {
  const variantClasses = {
    default:
      "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100",
    success:
      "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100",
    warning:
      "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100",
    error:
      "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100",
    info: "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100",
  }

  const iconClasses = {
    default: "text-blue-600 dark:text-blue-400",
    success: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    error: "text-red-600 dark:text-red-400",
    info: "text-blue-600 dark:text-blue-400",
  }

  const icons = {
    default: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertCircleIcon,
    info: Info,
  }

  const Icon = icons[variant]
  const colors = variantClasses[variant]
  const iconColor = iconClasses[variant]

  return (
    <div
      className={cn(
        "relative flex gap-3 p-4 rounded-lg border-2",
        colors,
        className
      )}
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", iconColor)} />
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold mb-1 text-sm">{title}</h4>
        )}
        {description && (
          <p className="text-sm opacity-90">{description}</p>
        )}
        {children}
      </div>
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-6 w-6 flex-shrink-0 opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
