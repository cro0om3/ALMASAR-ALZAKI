"use client"

import { ReactNode, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  closeOnOverlayClick?: boolean
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  className,
  closeOnOverlayClick = true,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <Card
        className={cn(
          "w-full border-2 border-gray-200 dark:border-gray-800 shadow-2xl bg-white dark:bg-blue-950 animate-in fade-in-0 zoom-in-95",
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || true) && (
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            {title && (
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {title}
              </CardTitle>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
        )}
        <CardContent className="space-y-4">{children}</CardContent>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 pb-6">
            {footer}
          </div>
        )}
      </Card>
    </div>
  )
}
