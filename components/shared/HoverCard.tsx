"use client"

import { ReactNode, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface HoverCardProps {
  children: ReactNode
  hoverContent?: ReactNode
  className?: string
  delay?: number
}

export function HoverCard({ children, hoverContent, className, delay = 200 }: HoverCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {hoverContent && isHovered && (
        <Card
          className={cn(
            "absolute z-50 mt-2 p-4 shadow-xl border-2 border-blue-200/60 dark:border-blue-800/60 bg-white dark:bg-blue-950 animate-fadeInUp",
            className
          )}
          style={{ animationDelay: `${delay}ms` }}
        >
          <CardContent className="p-0">
            {hoverContent}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
