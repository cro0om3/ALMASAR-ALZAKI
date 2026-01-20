"use client"

import { useEffect, useState } from "react"

interface TimeAgoProps {
  date: Date | string
  className?: string
}

export function TimeAgo({ date, className }: TimeAgoProps) {
  const [timeAgo, setTimeAgo] = useState("")

  useEffect(() => {
    const updateTimeAgo = () => {
      const now = new Date()
      const then = new Date(date)
      const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

      if (diffInSeconds < 60) {
        setTimeAgo("just now")
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        setTimeAgo(`${minutes} minute${minutes !== 1 ? "s" : ""} ago`)
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        setTimeAgo(`${hours} hour${hours !== 1 ? "s" : ""} ago`)
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400)
        setTimeAgo(`${days} day${days !== 1 ? "s" : ""} ago`)
      } else if (diffInSeconds < 2592000) {
        const weeks = Math.floor(diffInSeconds / 604800)
        setTimeAgo(`${weeks} week${weeks !== 1 ? "s" : ""} ago`)
      } else if (diffInSeconds < 31536000) {
        const months = Math.floor(diffInSeconds / 2592000)
        setTimeAgo(`${months} month${months !== 1 ? "s" : ""} ago`)
      } else {
        const years = Math.floor(diffInSeconds / 31536000)
        setTimeAgo(`${years} year${years !== 1 ? "s" : ""} ago`)
      }
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [date])

  return <span className={className}>{timeAgo}</span>
}
