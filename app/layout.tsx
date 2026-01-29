import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ServiceWorkerRegistration } from "@/components/shared/ServiceWorkerRegistration"
import { KeyboardShortcuts } from "@/components/shared/KeyboardShortcuts"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import { ScrollToTop } from "@/components/shared/ScrollToTop"
import { ShortcutsGuide } from "@/components/shared/ShortcutsGuide"
import { ScrollProgress } from "@/components/shared/ScrollProgress"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/AuthContext"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { SettingsHydration } from "@/components/shared/SettingsHydration"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ALMSAR ALZAKI Transport & Maintenance - CRM System",
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
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <SettingsHydration />
          <ServiceWorkerRegistration />
          <KeyboardShortcuts />
          <ErrorBoundary>
            <DashboardLayout>
              {children}
            </DashboardLayout>
          </ErrorBoundary>
          <ScrollToTop />
          <ShortcutsGuide />
          <ScrollProgress />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
