"use client"

import { useState, useRef } from "react"
import { Upload, X, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number // in MB
  onFileSelect?: (files: File[]) => void
  onFileRemove?: (file: File) => void
  className?: string
  label?: string
  description?: string
}

export function FileUpload({
  accept,
  multiple = false,
  maxSize,
  onFileSelect,
  onFileRemove,
  className,
  label = "Upload files",
  description,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setError("")

    if (maxSize) {
      const oversizedFiles = selectedFiles.filter(
        (file) => file.size > maxSize * 1024 * 1024
      )
      if (oversizedFiles.length > 0) {
        setError(`Files must be smaller than ${maxSize}MB`)
        return
      }
    }

    const newFiles = multiple ? [...files, ...selectedFiles] : selectedFiles
    setFiles(newFiles)
    onFileSelect?.(newFiles)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemove = (fileToRemove: File) => {
    const newFiles = files.filter((f) => f !== fileToRemove)
    setFiles(newFiles)
    onFileRemove?.(fileToRemove)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}

      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Choose Files
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {files.length > 0 && (
        <div className="space-y-2 mt-4">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <File className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(file)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
