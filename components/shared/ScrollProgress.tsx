"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface ScrollProgressProps {
  className?: string
  color?: string
  height?: number
}

export function ScrollProgress({
  className,
  color = "bg-blue-600",
  height = 3,
}: ScrollProgressProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollableHeight = documentHeight - windowHeight
      const progressPercent = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0
      setProgress(Math.min(100, Math.max(0, progressPercent)))
    }

    window.addEventListener("scroll", updateProgress)
    window.addEventListener("resize", updateProgress)
    updateProgress() // Initial calculation

    return () => {
      window.removeEventListener("scroll", updateProgress)
      window.removeEventListener("resize", updateProgress)
    }
  }, [])

  return (
    <div
      className={cn("fixed top-0 left-0 right-0 z-50", className)}
      style={{ height: `${height}px` }}
    >
      <div
        className={cn("h-full transition-all duration-150 ease-out", color)}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
