"use client"

import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PrintButtonProps {
  className?: string
  variant?: "default" | "outline" | "ghost"
  label?: string
  onPrint?: () => void
}

export function PrintButton({
  className,
  variant = "outline",
  label = "Print",
  onPrint,
}: PrintButtonProps) {
  const handlePrint = () => {
    if (onPrint) {
      onPrint()
    } else {
      window.print()
    }
  }

  return (
    <Button
      variant={variant}
      onClick={handlePrint}
      className={cn("gap-2", className)}
    >
      <Printer className="h-4 w-4" />
      {label}
    </Button>
  )
}
