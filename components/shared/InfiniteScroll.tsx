"use client"

import { ReactNode, useEffect, useRef, useState } from "react"

interface InfiniteScrollProps {
  children: ReactNode
  onLoadMore: () => void
  hasMore: boolean
  loader?: ReactNode
  threshold?: number
  className?: string
}

export function InfiniteScroll({
  children,
  onLoadMore,
  hasMore,
  loader,
  threshold = 200,
  className,
}: InfiniteScrollProps) {
  const [isLoading, setIsLoading] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!hasMore || isLoading) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setIsLoading(true)
          onLoadMore()
          setTimeout(() => setIsLoading(false), 1000)
        }
      },
      { rootMargin: `${threshold}px` }
    )

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current)
    }

    return () => {
      if (observerRef.current && sentinelRef.current) {
        observerRef.current.unobserve(sentinelRef.current)
      }
    }
  }, [hasMore, isLoading, onLoadMore, threshold])

  return (
    <div className={className}>
      {children}
      {hasMore && (
        <div ref={sentinelRef} className="h-4">
          {loader || (
            <div className="flex justify-center py-4">
              <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
