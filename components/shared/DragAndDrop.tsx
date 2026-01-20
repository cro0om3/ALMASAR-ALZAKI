"use client"

import { ReactNode, useState, DragEvent } from "react"
import { cn } from "@/lib/utils"
import { Upload, File } from "lucide-react"

interface DragAndDropProps {
  onDrop: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxSize?: number // in MB
  children?: ReactNode
  className?: string
}

export function DragAndDrop({
  onDrop,
  accept,
  multiple = false,
  maxSize = 10,
  children,
  className,
}: DragAndDropProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setError(null)

    const files = Array.from(e.dataTransfer.files)
    const validFiles: File[] = []

    files.forEach((file) => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File ${file.name} exceeds maximum size of ${maxSize}MB`)
        return
      }

      // Check file type if accept is specified
      if (accept) {
        const acceptedTypes = accept.split(",").map((type) => type.trim())
        const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
        const fileType = file.type

        const isAccepted = acceptedTypes.some((type) => {
          if (type.startsWith(".")) {
            return fileExtension === type
          }
          return fileType.match(type.replace("*", ".*"))
        })

        if (!isAccepted) {
          setError(`File ${file.name} is not an accepted file type`)
          return
        }
      }

      validFiles.push(file)
    })

    if (validFiles.length > 0) {
      onDrop(validFiles)
    }
  }

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-lg p-8 transition-all duration-300",
        isDragging
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
          : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30",
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children || (
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900/50 rounded-full">
            {isDragging ? (
              <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            ) : (
              <File className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isDragging ? "Drop files here" : "Drag and drop files here"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            or click to browse
          </p>
          {accept && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Accepted: {accept}
            </p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Max size: {maxSize}MB
          </p>
        </div>
      )}
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}
