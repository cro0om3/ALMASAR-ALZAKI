"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SearchBar } from "./SearchBar"

export function KeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input, textarea, or contenteditable
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Quick navigation shortcuts
      // Ctrl/Cmd + numbers for quick navigation
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
        switch (e.key) {
          case '1':
            e.preventDefault()
            router.push('/')
            break
          case '2':
            e.preventDefault()
            router.push('/quotations')
            break
          case '3':
            e.preventDefault()
            router.push('/invoices')
            break
          case '4':
            e.preventDefault()
            router.push('/customers')
            break
          case '5':
            e.preventDefault()
            router.push('/purchase-orders')
            break
          case '6':
            e.preventDefault()
            router.push('/settings')
            break
          case 'n':
            // New item - navigate to current page + /new
            e.preventDefault()
            const currentPath = window.location.pathname
            if (!currentPath.includes('/new') && !currentPath.includes('/edit')) {
              router.push(`${currentPath}/new`)
            }
            break
        }
      }

      // ? to show shortcuts help (can be implemented later)
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Could show a modal with shortcuts
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  return null
}
