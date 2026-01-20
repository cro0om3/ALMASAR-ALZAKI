"use client"

import { cn } from "@/lib/utils"

interface DividerProps {
  text?: string
  orientation?: "horizontal" | "vertical"
  className?: string
}

export function Divider({
  text,
  orientation = "horizontal",
  className,
}: DividerProps) {
  if (orientation === "vertical") {
    return (
      <div
        className={cn(
          "w-px bg-gray-200 dark:bg-gray-800 self-stretch",
          className
        )}
      />
    )
  }

  return (
    <div className={cn("relative flex items-center py-4", className)}>
      <div className="flex-grow border-t border-gray-200 dark:border-gray-800" />
      {text && (
        <span className="px-3 text-sm font-medium text-gray-500 dark:text-gray-400">
          {text}
        </span>
      )}
      <div className="flex-grow border-t border-gray-200 dark:border-gray-800" />
    </div>
  )
}
