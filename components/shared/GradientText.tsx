"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GradientTextProps {
  children: ReactNode
  className?: string
  variant?: 'blue' | 'gold' | 'purple' | 'green'
}

export function GradientText({ children, className, variant = 'blue' }: GradientTextProps) {
  const variants = {
    blue: 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent',
    gold: 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent',
    purple: 'bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent',
    green: 'bg-gradient-to-r from-green-600 via-green-700 to-green-800 bg-clip-text text-transparent',
  }

  return (
    <span className={cn(variants[variant], className)}>
      {children}
    </span>
  )
}
