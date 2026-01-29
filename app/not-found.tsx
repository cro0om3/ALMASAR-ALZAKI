"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileQuestion, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-8">
      <Card className="border-2 border-blue-400 dark:border-blue-800/60 max-w-md w-full shadow-lg">
        <CardHeader>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
              <FileQuestion className="h-16 w-16 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                404
              </CardTitle>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Page Not Found
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Link href="/" className="w-full">
              <Button
                variant="default"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
