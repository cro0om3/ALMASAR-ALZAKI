"use client"

import { ReactNode, useEffect } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface BackdropProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  showCloseButton?: boolean
  closeOnClickOutside?: boolean
}

export function Backdrop({
  isOpen,
  onClose,
  children,
  className,
  showCloseButton = true,
  closeOnClickOutside = true,
}: BackdropProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-fadeInUp"
      onClick={closeOnClickOutside ? onClose : undefined}
    >
      <div
        className={cn(
          "relative bg-white dark:bg-blue-950 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto animate-bounce-in",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}
