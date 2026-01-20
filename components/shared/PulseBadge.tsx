"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface PulseBadgeProps {
  children: ReactNode
  variant?: "default" | "destructive" | "success" | "warning"
  pulse?: boolean
  className?: string
}

export function PulseBadge({ children, variant = "default", pulse = false, className }: PulseBadgeProps) {
  return (
    <Badge
      variant={variant}
      className={cn(
        "relative",
        pulse && "animate-pulse-glow",
        className
      )}
    >
      {children}
      {pulse && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-current"></span>
        </span>
      )}
    </Badge>
  )
}
