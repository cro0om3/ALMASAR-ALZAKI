"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CardSkeletonProps {
  className?: string
  showHeader?: boolean
  lines?: number
}

export function CardSkeleton({
  className,
  showHeader = true,
  lines = 3,
}: CardSkeletonProps) {
  return (
    <Card className={cn("border-2 border-gray-200 dark:border-gray-800", className)}>
      {showHeader && (
        <CardHeader>
          <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse",
              i === lines - 1 && "w-2/3"
            )}
          />
        ))}
      </CardContent>
    </Card>
  )
}
