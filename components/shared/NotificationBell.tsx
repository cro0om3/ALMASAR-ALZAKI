"use client"

import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NotificationBellProps {
  count?: number
  onClick?: () => void
  className?: string
  variant?: "default" | "minimal"
}

export function NotificationBell({
  count = 0,
  onClick,
  className,
  variant = "default",
}: NotificationBellProps) {
  const hasNotifications = count > 0

  if (variant === "minimal") {
    return (
      <button
        onClick={onClick}
        className={cn(
          "relative inline-flex items-center justify-center",
          className
        )}
      >
        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        {hasNotifications && (
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white dark:border-blue-950" />
        )}
      </button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn("relative", className)}
    >
      <Bell className="h-5 w-5" />
      {hasNotifications && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold rounded-full"
        >
          {count > 9 ? "9+" : count}
        </Badge>
      )}
      <span className="sr-only">Notifications</span>
    </Button>
  )
}
