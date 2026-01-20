"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface SwitchProps {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  label?: string
  description?: string
  className?: string
}

export function Switch({
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  label,
  description,
  className,
}: SwitchProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked)
  const checked = controlledChecked !== undefined ? controlledChecked : internalChecked

  const handleToggle = () => {
    if (disabled) return
    const newChecked = !checked
    if (controlledChecked === undefined) {
      setInternalChecked(newChecked)
    }
    onCheckedChange?.(newChecked)
  }

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          checked
            ? "bg-blue-600 dark:bg-blue-500"
            : "bg-gray-200 dark:bg-gray-700"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <label
              onClick={handleToggle}
              className={cn(
                "text-sm font-medium cursor-pointer",
                disabled
                  ? "text-gray-400 dark:text-gray-600"
                  : "text-gray-900 dark:text-gray-100"
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
