"use client"

import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { MobileBottomNav } from "@/components/layout/MobileBottomNav"

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const isLoginPage = pathname === "/login"

  useEffect(() => {
    setMounted(true)
  }, [])

  // Avoid hydration mismatch: render same shell on server and first client paint for layout pages only
  if (!mounted) {
    if (isLoginPage) {
      return <>{children}</>
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-blue-50/40 to-white dark:from-blue-950 dark:via-blue-900/95">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden lg:ml-64">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-white via-blue-50/40 to-white dark:from-blue-950 dark:via-blue-900/95 dark:to-blue-950 p-4 lg:p-6 pb-20 lg:pb-6 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        <MobileBottomNav />
      </div>
    </div>
  )
}
