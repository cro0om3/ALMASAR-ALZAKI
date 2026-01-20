"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ShimmerEffectProps {
  children: ReactNode
  className?: string
  enabled?: boolean
}

export function ShimmerEffect({ children, className, enabled = true }: ShimmerEffectProps) {
  if (!enabled) return <>{children}</>

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </div>
  )
}
