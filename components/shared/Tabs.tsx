"use client"

import { useState, ReactNode, useEffect } from "react"
import { cn } from "@/lib/utils"

interface Tab {
  id: string
  label: string
  content: ReactNode
  icon?: ReactNode
  badge?: number | string
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  activeTab?: string
  onChange?: (tabId: string) => void
  className?: string
}

export function Tabs({ tabs, defaultTab, activeTab: controlledActiveTab, onChange, className }: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || tabs[0]?.id)
  
  // Use controlled tab if provided, otherwise use internal state
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab

  useEffect(() => {
    if (defaultTab && !controlledActiveTab) {
      setInternalActiveTab(defaultTab)
    }
  }, [defaultTab, controlledActiveTab])

  const handleTabChange = (tabId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId)
    }
    onChange?.(tabId)
  }

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content

  return (
    <div className={cn("w-full", className)}>
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={(e) => handleTabChange(tab.id, e)}
              className={cn(
                "relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                "hover:bg-gray-50 dark:hover:bg-gray-900/50",
                activeTab === tab.id
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              )}
            >
              <div className="flex items-center gap-2">
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={cn(
                      "ml-1 px-2 py-0.5 text-xs font-semibold rounded-full",
                      activeTab === tab.id
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4 animate-fadeInUp">{activeTabContent}</div>
    </div>
  )
}
