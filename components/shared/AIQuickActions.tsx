"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Modal } from "./Modal"
import { AIAssistant } from "./AIAssistant"
import { Sparkles, FileText, Mail, Languages, Lightbulb } from "lucide-react"
import { aiService } from "@/lib/services/ai-service"

interface AIQuickActionsProps {
  onGeneratedText?: (text: string, type: string) => void
}

export function AIQuickActions({ onGeneratedText }: AIQuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedMode, setSelectedMode] = useState<'product-description' | 'invoice-note' | 'translation' | 'quotation-terms' | 'email-response'>('product-description')

  if (!aiService.isEnabled()) {
    return null
  }

  const modes = [
    {
      id: 'product-description' as const,
      label: 'Product Description',
      icon: FileText,
      description: 'Generate product descriptions',
    },
    {
      id: 'invoice-note' as const,
      label: 'Invoice Note',
      icon: FileText,
      description: 'Generate invoice notes',
    },
    {
      id: 'translation' as const,
      label: 'Translation',
      icon: Languages,
      description: 'Translate text',
    },
    {
      id: 'quotation-terms' as const,
      label: 'Quotation Terms',
      icon: FileText,
      description: 'Generate terms & conditions',
    },
    {
      id: 'email-response' as const,
      label: 'Email Response',
      icon: Mail,
      description: 'Generate email responses',
    },
  ]

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/50"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        AI Assistant
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="AI Assistant"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {modes.map((mode) => {
              const Icon = mode.icon
              return (
                <Button
                  key={mode.id}
                  variant={selectedMode === mode.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMode(mode.id)}
                  className="flex-1 min-w-[150px]"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {mode.label}
                </Button>
              )
            })}
          </div>

          <AIAssistant
            mode={selectedMode}
            onResult={(text) => {
              onGeneratedText?.(text, selectedMode)
              setIsOpen(false)
            }}
          />
        </div>
      </Modal>
    </>
  )
}
