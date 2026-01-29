"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  delay?: number
}

export function AnimatedCard({ children, className, hover = true, delay = 0 }: AnimatedCardProps) {
  return (
    <Card
      className={cn(
        "border-2 border-blue-400 dark:border-blue-800/60 shadow-card transition-all duration-300 bg-gradient-card",
        hover && "hover:shadow-card-hover hover:scale-[1.02] hover:border-blue-300 dark:hover:border-blue-700",
        className
      )}
      style={{
        animation: `fadeInUp 0.6s ease-out ${delay}ms both`,
      }}
    >
      {children}
    </Card>
  )
}
