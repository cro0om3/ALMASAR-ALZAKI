"use client"

import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface IconButtonProps {
  icon: LucideIcon
  onClick?: () => void
  variant?: "default" | "outline" | "ghost" | "gold"
  size?: "sm" | "md" | "lg"
  className?: string
  tooltip?: string
  disabled?: boolean
}

export function IconButton({
  icon: Icon,
  onClick,
  variant = "ghost",
  size = "md",
  className,
  tooltip,
  disabled,
}: IconButtonProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  const variantClasses = {
    default: "bg-blue-600 hover:bg-blue-700 text-white",
    outline: "border-2 border-blue-200/60 dark:border-blue-800/60 hover:bg-blue-50 dark:hover:bg-blue-900",
    ghost: "hover:bg-blue-50 dark:hover:bg-blue-900",
    gold: "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-blue-900 shadow-gold",
  }

  return (
    <Button
      variant={variant === "gold" ? "default" : variant}
      size="icon"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        sizeClasses[size],
        variant === "gold" && variantClasses.gold,
        variant !== "gold" && variantClasses[variant],
        "transition-all duration-300 hover:scale-110 active:scale-95",
        className
      )}
      title={tooltip}
    >
      <Icon className="h-5 w-5" />
    </Button>
  )
}
