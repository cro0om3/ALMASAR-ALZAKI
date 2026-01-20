"use client"

import { useState, useEffect } from "react"
import { Modal } from "./Modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Keyboard, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Shortcut {
  keys: string[]
  description: string
  category: string
}

const shortcuts: Shortcut[] = [
  {
    keys: ['Ctrl', 'K'],
    description: 'Open global search',
    category: 'Navigation',
  },
  {
    keys: ['Ctrl', 'Shift', 'K'],
    description: 'Open quick actions',
    category: 'Navigation',
  },
  {
    keys: ['Ctrl', '1'],
    description: 'Go to Dashboard',
    category: 'Navigation',
  },
  {
    keys: ['Ctrl', '2'],
    description: 'Go to Quotations',
    category: 'Navigation',
  },
  {
    keys: ['Ctrl', '3'],
    description: 'Go to Invoices',
    category: 'Navigation',
  },
  {
    keys: ['Ctrl', '4'],
    description: 'Go to Customers',
    category: 'Navigation',
  },
  {
    keys: ['Ctrl', '5'],
    description: 'Go to Purchase Orders',
    category: 'Navigation',
  },
  {
    keys: ['Ctrl', '6'],
    description: 'Go to Settings',
    category: 'Navigation',
  },
  {
    keys: ['Ctrl', 'N'],
    description: 'Create new item (context-aware)',
    category: 'Actions',
  },
  {
    keys: ['?'],
    description: 'Show this shortcuts guide',
    category: 'Help',
  },
]

export function ShortcutsGuide() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement
        if (
          target.tagName !== 'INPUT' &&
          target.tagName !== 'TEXTAREA' &&
          !target.isContentEditable
        ) {
          e.preventDefault()
          setIsOpen(true)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = []
    }
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, Shortcut[]>)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-full h-12 w-12"
        title="Keyboard Shortcuts (Press ?)"
      >
        <Keyboard className="h-5 w-5" />
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Keyboard Shortcuts"
        size="lg"
      >
        <div className="space-y-6">
          {Object.entries(groupedShortcuts).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-3 uppercase tracking-wider">
                {category}
              </h3>
              <div className="space-y-2">
                {items.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-800"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <div key={keyIndex} className="flex items-center gap-1">
                          {keyIndex > 0 && (
                            <span className="text-gray-400">+</span>
                          )}
                          <Badge
                            variant="outline"
                            className="font-mono text-xs px-2 py-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                          >
                            {key}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  )
}
