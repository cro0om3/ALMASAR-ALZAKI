"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="flex items-center justify-center min-h-screen p-8 bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-blue-950 dark:via-blue-900 dark:to-blue-950">
          <Card className="border-2 border-red-200 dark:border-red-800 max-w-md w-full shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-red-900 dark:text-red-100">
                  Application Error
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {error.message || 'A critical error occurred. Please refresh the page.'}
              </p>
              {error.digest && (
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Error ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{error.digest}</code>
                </p>
              )}
              <Button
                onClick={reset}
                variant="default"
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}
