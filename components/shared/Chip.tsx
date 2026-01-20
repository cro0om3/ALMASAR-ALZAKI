"use client"

import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChipProps {
  label: string
  onRemove?: () => void
  variant?: "default" | "primary" | "success" | "warning" | "danger"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Chip({
  label,
  onRemove,
  variant = "default",
  size = "md",
  className,
}: ChipProps) {
  const variantClasses = {
    default:
      "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
    primary:
      "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
    success:
      "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
    warning:
      "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
    danger: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
  }

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors p-0.5"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  )
}
