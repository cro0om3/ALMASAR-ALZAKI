"use client"

import { ReactNode, useState } from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  position?: "top" | "bottom" | "left" | "right"
  delay?: number
  className?: string
}

export function Tooltip({
  content,
  children,
  position = "top",
  delay = 200,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    const id = setTimeout(() => setIsVisible(true), delay)
    setTimeoutId(id)
  }

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    setIsVisible(false)
  }

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-gray-100",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-gray-100",
    left: "left-full top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-100",
    right: "right-full top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-100",
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-100 rounded-lg shadow-lg whitespace-nowrap pointer-events-none animate-fadeInUp",
            positionClasses[position],
            className
          )}
        >
          {content}
          <div
            className={cn(
              "absolute w-0 h-0 border-4 border-transparent",
              arrowClasses[position]
            )}
          />
        </div>
      )}
    </div>
  )
}
