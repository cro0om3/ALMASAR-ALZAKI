"use client"

import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

interface CountUpProps {
  end: number
  duration?: number
  start?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
  onComplete?: () => void
}

export function CountUp({
  end,
  duration = 2000,
  start = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
  onComplete,
}: CountUpProps) {
  const [count, setCount] = useState(start)
  const [isCounting, setIsCounting] = useState(false)
  const frameRef = useRef<number>()
  const startTimeRef = useRef<number>()

  useEffect(() => {
    setIsCounting(true)
    startTimeRef.current = Date.now()

    const animate = () => {
      const now = Date.now()
      const elapsed = now - (startTimeRef.current || 0)
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = start + (end - start) * easeOut

      setCount(current)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        setIsCounting(false)
        onComplete?.()
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [end, duration, start, onComplete])

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </span>
  )
}
