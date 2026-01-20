"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface ConfettiEffectProps {
  trigger: boolean
  duration?: number
  className?: string
}

export function ConfettiEffect({
  trigger,
  duration = 3000,
  className,
}: ConfettiEffectProps) {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (trigger) {
      setIsActive(true)
      const timer = setTimeout(() => setIsActive(false), duration)
      return () => clearTimeout(timer)
    }
  }, [trigger, duration])

  if (!isActive) return null

  return (
    <div
      className={cn(
        "fixed inset-0 pointer-events-none z-50 overflow-hidden",
        className
      )}
    >
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        >
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              i % 4 === 0 && "bg-yellow-400",
              i % 4 === 1 && "bg-blue-500",
              i % 4 === 2 && "bg-green-500",
              i % 4 === 3 && "bg-purple-500"
            )}
          />
        </div>
      ))}
    </div>
  )
}
