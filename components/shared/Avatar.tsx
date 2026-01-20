"use client"

import { User } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function Avatar({ src, alt, name, size = "md", className }: AvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  }

  const getInitials = (name?: string) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (src) {
    return (
      <div
        className={cn(
          "relative rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center",
          sizeClasses[size],
          className
        )}
      >
        <Image
          src={src}
          alt={alt || name || "Avatar"}
          fill
          className="object-cover"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-800 text-white flex items-center justify-center font-semibold",
        sizeClasses[size],
        className
      )}
    >
      {name ? getInitials(name) : <User className="h-1/2 w-1/2" />}
    </div>
  )
}
