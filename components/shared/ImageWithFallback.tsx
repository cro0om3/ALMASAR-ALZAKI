"use client"

import { useState, ImgHTMLAttributes } from "react"
import { ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  fallback?: string
  className?: string
}

export function ImageWithFallback({
  src,
  alt,
  fallback,
  className,
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      if (fallback) {
        setImgSrc(fallback)
      }
    }
  }

  if (hasError && !fallback) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100 dark:bg-gray-800",
          className
        )}
        {...props}
      >
        <ImageIcon className="h-8 w-8 text-gray-400" />
      </div>
    )
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className={className}
      {...props}
    />
  )
}
