"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface DropdownOption {
  value: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
  divider?: boolean
}

interface DropdownProps {
  options: DropdownOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  size?: "sm" | "md" | "lg"
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className,
  disabled = false,
  size = "md",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const selectedOption = options.find((opt) => opt.value === value)

  const sizeClasses = {
    sm: "h-8 text-sm px-3",
    md: "h-10 text-sm px-4",
    lg: "h-12 text-base px-4",
  }

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-blue-900 text-left transition-colors",
          "hover:border-blue-400 dark:hover:border-blue-600",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          sizeClasses[size]
        )}
      >
        <span className={cn(
          "truncate",
          !selectedOption && "text-gray-500 dark:text-gray-400"
        )}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-blue-950 border-2 border-gray-200 dark:border-gray-800 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option, index) => {
            if (option.divider) {
              return (
                <div
                  key={`divider-${index}`}
                  className="h-px bg-gray-200 dark:bg-gray-800 my-1"
                />
              )
            }

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  if (!option.disabled) {
                    onChange?.(option.value)
                    setIsOpen(false)
                  }
                }}
                disabled={option.disabled}
                className={cn(
                  "w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors",
                  "hover:bg-blue-50 dark:hover:bg-blue-900",
                  option.value === value &&
                    "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100",
                  option.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {option.icon && <span>{option.icon}</span>}
                <span>{option.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
