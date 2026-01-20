"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Command } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: React.ReactNode
  action: () => void
  keywords?: string[]
}

interface CommandPaletteProps {
  commands: CommandItem[]
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({
  commands,
  isOpen,
  onClose,
}: CommandPaletteProps) {
  const [search, setSearch] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        // Toggle handled by parent
      }

      if (!isOpen) return

      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        )
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
      } else if (e.key === "Enter") {
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action()
          onClose()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, selectedIndex, onClose])

  const filteredCommands = commands.filter((cmd) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.description?.toLowerCase().includes(searchLower) ||
      cmd.keywords?.some((kw) => kw.toLowerCase().includes(searchLower))
    )
  })

  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-blue-950 rounded-lg shadow-xl border-2 border-blue-200/60 dark:border-blue-800/60 overflow-hidden animate-bounce-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <Search className="h-5 w-5 text-gray-400" />
          <Input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or search..."
            className="border-0 focus-visible:ring-0 text-base"
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 px-1.5 font-mono text-xs text-gray-500">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              No commands found
            </div>
          ) : (
            <div className="py-2">
              {filteredCommands.map((cmd, index) => (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.action()
                    onClose()
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors",
                    index === selectedIndex && "bg-blue-50 dark:bg-blue-900/30"
                  )}
                >
                  {cmd.icon && (
                    <div className="flex-shrink-0 text-gray-400">
                      {cmd.icon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      {cmd.label}
                    </p>
                    {cmd.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {cmd.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
