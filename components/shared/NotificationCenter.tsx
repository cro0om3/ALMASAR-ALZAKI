"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, X, Check, AlertCircle, Info, CheckCircle, AlertTriangle } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { NotificationBell } from "./NotificationBell"

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  actionLabel?: string
}

interface NotificationCenterProps {
  notifications?: Notification[]
  maxVisible?: number
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
  onDelete?: (id: string) => void
  onClearAll?: () => void
}

export function NotificationCenter({
  notifications = [],
  maxVisible = 5,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(notifications)

  useEffect(() => {
    setLocalNotifications(notifications)
  }, [notifications])

  const unreadCount = localNotifications.filter(n => !n.read).length
  const visibleNotifications = localNotifications.slice(0, maxVisible)

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
      default:
        return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20'
      case 'warning':
        return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/20'
      case 'error':
        return 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20'
      default:
        return 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20'
    }
  }

  const handleMarkAsRead = (id: string) => {
    setLocalNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    )
    onMarkAsRead?.(id)
  }

  const handleMarkAllAsRead = () => {
    setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })))
    onMarkAllAsRead?.()
  }

  const handleDelete = (id: string) => {
    setLocalNotifications(prev => prev.filter(n => n.id !== id))
    onDelete?.(id)
  }

  const handleClearAll = () => {
    setLocalNotifications([])
    onClearAll?.()
  }

  return (
    <div className="relative">
      <NotificationBell
        count={unreadCount}
        onClick={() => setIsOpen(!isOpen)}
        variant="default"
      />

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Panel */}
          <Card className="absolute right-0 top-12 w-96 max-h-[600px] z-50 border-2 border-blue-200/60 dark:border-blue-800/60 shadow-2xl">
            <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-gold dark:text-yellow-400" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadCount}
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {visibleNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400">No notifications</p>
                </div>
              ) : (
                <>
                  {unreadCount > 0 && (
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        className="text-xs"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Mark all as read
                      </Button>
                      {onClearAll && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearAll}
                          className="text-xs text-red-600 dark:text-red-400"
                        >
                          Clear all
                        </Button>
                      )}
                    </div>
                  )}
                  <div className="max-h-[400px] overflow-y-auto">
                    {visibleNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${
                          !notification.read ? getNotificationColor(notification.type) : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="h-2 w-2 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0 mt-1.5" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(notification.timestamp)}
                              </span>
                              <div className="flex items-center gap-2">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="h-6 text-xs"
                                  >
                                    Mark read
                                  </Button>
                                )}
                                {notification.actionUrl && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="h-6 text-xs"
                                  >
                                    <a href={notification.actionUrl}>
                                      {notification.actionLabel || 'View'}
                                    </a>
                                  </Button>
                                )}
                                {onDelete && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(notification.id)}
                                    className="h-6 w-6 p-0 text-red-600 dark:text-red-400"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
