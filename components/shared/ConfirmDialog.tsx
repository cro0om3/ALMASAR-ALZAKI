"use client"

import { useState, ReactNode } from "react"
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ConfirmDialogProps {
  title: string
  message: string
  type?: "warning" | "danger" | "info" | "success"
  onConfirm: () => void
  onCancel?: () => void
  confirmLabel?: string
  cancelLabel?: string
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ConfirmDialog({
  title,
  message,
  type = "warning",
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  trigger,
  open: controlledOpen,
  onOpenChange,
}: ConfirmDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen

  const handleConfirm = () => {
    onConfirm()
    setIsOpen(false)
  }

  const handleCancel = () => {
    onCancel?.()
    setIsOpen(false)
  }

  const iconColors = {
    warning: "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900",
    danger: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900",
    info: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900",
    success: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900",
  }

  const buttonColors = {
    warning: "bg-yellow-500 hover:bg-yellow-600 text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    info: "bg-blue-500 hover:bg-blue-600 text-white",
    success: "bg-green-500 hover:bg-green-600 text-white",
  }

  const IconComponent = type === "danger" ? AlertTriangle : type === "success" ? CheckCircle2 : Info

  return (
    <>
      {trigger && (
        <div onClick={() => setIsOpen(true)}>
          {trigger}
        </div>
      )}
      
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={handleCancel}
        >
          <Card
            className="w-full max-w-md border-2 border-gray-200 dark:border-gray-800 shadow-2xl bg-white dark:bg-blue-950"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${iconColors[type]}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {title}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {message}
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="border-2 border-gray-300 dark:border-gray-700"
                >
                  {cancelLabel}
                </Button>
                <Button
                  onClick={handleConfirm}
                  className={buttonColors[type]}
                >
                  {confirmLabel}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
