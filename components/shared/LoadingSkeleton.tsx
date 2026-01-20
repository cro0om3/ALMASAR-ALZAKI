"use client"

import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  width?: string | number
  height?: string | number
  count?: number
}

export function LoadingSkeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  count = 1,
}: LoadingSkeletonProps) {
  const baseClasses = "skeleton rounded"

  const variantClasses = {
    text: "h-4",
    circular: "rounded-full",
    rectangular: "",
    card: "h-48",
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={cn(baseClasses, variantClasses[variant], className)}
            style={style}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  )
}
