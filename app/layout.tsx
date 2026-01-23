import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { MobileBottomNav } from "@/components/layout/MobileBottomNav"
import { ServiceWorkerRegistration } from "@/components/shared/ServiceWorkerRegistration"
import { KeyboardShortcuts } from "@/components/shared/KeyboardShortcuts"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import { ScrollToTop } from "@/components/shared/ScrollToTop"
import { ShortcutsGuide } from "@/components/shared/ShortcutsGuide"
import { ScrollProgress } from "@/components/shared/ScrollProgress"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/AuthContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ALMSAR ALZAKI T&M - CRM System",
  description: "Complete CRM system for managing quotations, invoices, customers, and more",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ALMSAR ALZAKI CRM",
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  document.documentElement.classList.toggle('dark', theme === 'dark');
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ServiceWorkerRegistration />
          <KeyboardShortcuts />
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden lg:ml-64">
              <Header />
              <main className="flex-1 overflow-y-auto bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-blue-950 dark:via-blue-900 dark:to-blue-950 p-4 lg:p-6 pb-20 lg:pb-6">
                <div className="max-w-7xl mx-auto">
                  <ErrorBoundary>
                    {children}
                  </ErrorBoundary>
                </div>
              </main>
              <MobileBottomNav />
            </div>
          </div>
          <ScrollToTop />
          <ShortcutsGuide />
          <ScrollProgress />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
