"use client"

import { LoadingSpinner } from "@/components/shared/LoadingSpinner"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner text="Loading..." />
    </div>
  )
}
