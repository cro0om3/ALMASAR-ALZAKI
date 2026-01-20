"use client"

import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FloatingActionButtonProps {
  icon: LucideIcon
  onClick: () => void
  label?: string
  variant?: "default" | "gold"
  className?: string
}

export function FloatingActionButton({
  icon: Icon,
  onClick,
  label,
  variant = "default",
  className,
}: FloatingActionButtonProps) {
  return (
    <div className="fixed bottom-24 right-4 z-50">
      <Button
        onClick={onClick}
        size="lg"
        className={cn(
          "rounded-full shadow-lg hover:shadow-xl transition-all duration-300 h-14 w-14 p-0",
          variant === "gold"
            ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-blue-900 shadow-gold"
            : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white",
          className
        )}
        title={label}
      >
        <Icon className="h-6 w-6" />
      </Button>
    </div>
  )
}
