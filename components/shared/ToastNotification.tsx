"use client"

import { useEffect, useState } from "react"
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastNotificationProps {
  id: string
  title: string
  description?: string
  variant?: "success" | "error" | "warning" | "info"
  duration?: number
  onClose: (id: string) => void
}

export function ToastNotification({
  id,
  title,
  description,
  variant = "info",
  duration = 5000,
  onClose,
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(id), 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const variants = {
    success: {
      icon: CheckCircle2,
      bg: "bg-green-50 dark:bg-green-900/30",
      border: "border-green-200 dark:border-green-800",
      iconColor: "text-green-600 dark:text-green-400",
      titleColor: "text-green-900 dark:text-green-100",
    },
    error: {
      icon: AlertCircle,
      bg: "bg-red-50 dark:bg-red-900/30",
      border: "border-red-200 dark:border-red-800",
      iconColor: "text-red-600 dark:text-red-400",
      titleColor: "text-red-900 dark:text-red-100",
    },
    warning: {
      icon: AlertTriangle,
      bg: "bg-yellow-50 dark:bg-yellow-900/30",
      border: "border-yellow-200 dark:border-yellow-800",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      titleColor: "text-yellow-900 dark:text-yellow-100",
    },
    info: {
      icon: Info,
      bg: "bg-blue-50 dark:bg-blue-900/30",
      border: "border-blue-200 dark:border-blue-800",
      iconColor: "text-blue-600 dark:text-blue-400",
      titleColor: "text-blue-900 dark:text-blue-100",
    },
  }

  const { icon: Icon, bg, border, iconColor, titleColor } = variants[variant]

  return (
    <div
      className={cn(
        "min-w-[320px] max-w-md p-4 rounded-lg border-2 shadow-lg transition-all duration-300",
        bg,
        border,
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", iconColor)} />
        <div className="flex-1 min-w-0">
          <p className={cn("font-semibold text-sm", titleColor)}>{title}</p>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onClose(id), 300)
          }}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
