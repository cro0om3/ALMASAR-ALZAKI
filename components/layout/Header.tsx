"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Bell, Check, Trash2, Sun, Moon, LogOut } from "lucide-react"
import { useTheme } from "@/lib/hooks/use-theme"
import { useAuth } from "@/contexts/AuthContext"
import { SearchBar } from "@/components/shared/SearchBar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { notificationService } from "@/lib/data/notification-service"
import { Notification } from "@/types"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

export function Header() {
  const router = useRouter()
  const { theme, toggleTheme, mounted } = useTheme()
  const { user, signOut } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const loadNotifications = () => {
    const allNotifications = notificationService.getAll()
    setNotifications(allNotifications)
    setUnreadCount(notificationService.getUnreadCount())
  }

  useEffect(() => {
    loadNotifications()
    // Reload notifications when window gains focus
    const handleFocus = () => loadNotifications()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    notificationService.markAsRead(id)
    loadNotifications()
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    notificationService.delete(id)
    loadNotifications()
  }

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead()
    loadNotifications()
  }

  const handleNotificationClick = (notification: Notification) => {
    notificationService.markAsRead(notification.id)
    loadNotifications()
    if (notification.link) {
      router.push(notification.link)
    }
  }

  const getNotificationVariant = (type: string) => {
    switch (type) {
      case 'residence_expiring':
        return 'warning'
      case 'invoice_overdue':
        return 'destructive'
      case 'invoice_pending':
        return 'default'
      case 'payslip_unpaid':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b-2 border-blue-200/60 dark:border-blue-800/60 bg-gradient-to-r from-white via-blue-50/50 to-white dark:from-blue-950 dark:via-blue-900 dark:to-blue-950 shadow-md">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6 gap-4">
        <div className="lg:hidden">
          <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">ALMSAR ALZAKI</span>
        </div>
        <div className="hidden lg:block flex-1 max-w-md">
          <SearchBar />
        </div>
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            disabled={!mounted}
          >
            {mounted ? (
              theme === "dark" ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              )
            ) : (
              <Moon className="h-5 w-5 text-blue-700" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-100 relative">
                <Bell className="h-5 w-5 text-blue-700" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold rounded-full"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 border-blue-200 max-h-[500px] overflow-y-auto">
              <div className="flex items-center justify-between px-2 py-1.5">
                <DropdownMenuLabel className="text-blue-900 font-bold">Notifications</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs h-7 text-blue-600 hover:text-blue-800"
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="px-2 py-8 text-center text-sm text-gray-500 dark:text-gray-300">
                  No notifications
                </div>
              ) : (
                notifications.slice(0, 10).map((notification) => (
                  <div key={notification.id}>
                    <DropdownMenuItem
                      className={`flex flex-col items-start px-3 py-3 cursor-pointer hover:bg-blue-50 ${!notification.read ? 'bg-blue-50/50' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start justify-between w-full mb-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getNotificationVariant(notification.type)} className="text-xs">
                            {notification.type.replace('_', ' ')}
                          </Badge>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => handleDelete(notification.id, e)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="font-semibold text-sm text-blue-900 mb-1">
                        {notification.title}
                      </div>
                      <div className="text-xs text-gray-600 mb-1">
                        {notification.message}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-300">
                        {formatDate(notification.createdAt)}
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </div>
                ))
              )}
              {notifications.length > 10 && (
                <div className="px-2 py-2 text-center text-xs text-gray-500 dark:text-gray-300">
                  Showing first 10 notifications
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-100">
                <User className="h-5 w-5 text-blue-700" />
                <span className="sr-only">Open user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-blue-200">
              <DropdownMenuLabel className="text-blue-900">
                {user?.name || user?.email || 'User'}
              </DropdownMenuLabel>
              <div className="px-2 py-1.5">
                <Badge variant="outline" className="text-xs">
                  {user?.role || 'user'}
                </Badge>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:bg-blue-50">Profile</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-blue-50">
                <Link href="/settings" className="w-full">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 hover:bg-red-50 cursor-pointer"
                onClick={signOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
