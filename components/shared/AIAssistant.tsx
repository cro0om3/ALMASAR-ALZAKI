"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "./Switch"
import { Alert } from "./Alert"
import { LoadingSpinner } from "./LoadingSpinner"
import { Sparkles, Send, X, Copy, Check, Lightbulb, FileText, Mail, TrendingUp, DollarSign, Languages } from "lucide-react"
import { aiService } from "@/lib/services/ai-service"
import { useToast } from "@/lib/hooks/use-toast"

interface AIAssistantProps {
  mode?: 'general' | 'product-description' | 'invoice-note' | 'translation' | 'quotation-terms' | 'email-response'
  initialPrompt?: string
  context?: string
  onResult?: (result: string) => void
  placeholder?: string
  className?: string
}

const AI_MODES = {
  general: { label: 'General Assistant', icon: Sparkles, description: 'Ask anything' },
  'product-description': { label: 'Product Description', icon: FileText, description: 'Generate product descriptions' },
  'invoice-note': { label: 'Invoice Note', icon: FileText, description: 'Generate invoice notes' },
  translation: { label: 'Translation', icon: Languages, description: 'Translate text' },
  'quotation-terms': { label: 'Quotation Terms', icon: FileText, description: 'Generate terms & conditions' },
  'email-response': { label: 'Email Response', icon: Mail, description: 'Generate email responses' },
}

export function AIAssistant({
  mode = 'general',
  initialPrompt = '',
  context,
  onResult,
  placeholder,
  className,
}: AIAssistantProps) {
  const { toast } = useToast()
  const [prompt, setPrompt] = useState(initialPrompt)
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return aiService.isEnabled()
    }
    return false
  })

  const modeConfig = AI_MODES[mode]

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    if (!aiEnabled) {
      setError('AI is not enabled. Please enable it in Settings and add your OpenAI API key.')
      return
    }

    setIsLoading(true)
    setError('')
    setResult('')

    try {
      let response
      
      switch (mode) {
        case 'product-description':
          response = await aiService.generateProductDescription(prompt, context)
          break
        case 'invoice-note':
          response = await aiService.generateInvoiceNote(prompt, parseFloat(context || '0'))
          break
        case 'translation':
          const targetLang = context === 'ar' ? 'ar' : 'en'
          response = await aiService.translateText(prompt, targetLang)
          break
        case 'quotation-terms':
          response = await aiService.generateQuotationTerms(prompt, context)
          break
        case 'email-response':
          response = await aiService.generateEmailResponse(prompt, context)
          break
        default:
          response = await aiService.generateText({ prompt: context ? `${prompt}\n\nContext: ${context}` : prompt })
          break
      }

      if (typeof response === 'string') {
        setResult(response)
        onResult?.(response)
      } else {
        if (response.error) {
          setError(response.error)
          toast({
            title: 'AI Error',
            description: response.error,
            variant: 'destructive',
          })
        } else {
          setResult(response.text)
          onResult?.(response.text)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate response'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      toast({
        title: 'Copied!',
        description: 'Text copied to clipboard',
        variant: 'success',
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getPlaceholder = () => {
    if (placeholder) return placeholder
    
    switch (mode) {
      case 'product-description':
        return 'Enter product name and category...'
      case 'invoice-note':
        return 'Enter customer name...'
      case 'translation':
        return 'Enter text to translate...'
      case 'quotation-terms':
        return 'Enter service type and duration...'
      case 'email-response':
        return 'Enter customer query...'
      default:
        return 'Enter your prompt...'
    }
  }

  return (
    <Card className={`border-2 border-blue-400 dark:border-blue-800/60 shadow-card ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
              <modeConfig.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100">
                AI Assistant
              </CardTitle>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {modeConfig.description}
              </p>
            </div>
          </div>
          <Badge variant={aiEnabled ? 'success' : 'secondary'} className="text-xs">
            {aiEnabled ? 'AI Enabled' : 'AI Disabled'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!aiEnabled && (
          <Alert
            variant="warning"
            title="AI Not Enabled"
            description="Enable AI in Settings and add your OpenAI API key to use this feature."
            onClose={() => setError('')}
          />
        )}

        {error && (
          <Alert
            variant="error"
            title="Error"
            description={error}
            onClose={() => setError('')}
          />
        )}

        <div className="space-y-2">
          <Label htmlFor="ai-prompt" className="text-blue-900 dark:text-blue-100">
            {mode === 'translation' ? 'Text to Translate' : 'Prompt'}
          </Label>
          <Textarea
            id="ai-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={getPlaceholder()}
            rows={4}
            className="border-2 border-blue-400 dark:border-blue-800/60"
            disabled={isLoading || !aiEnabled}
          />
        </div>

        {mode === 'translation' && (
          <div className="space-y-2">
            <Label className="text-blue-900 dark:text-blue-100">Target Language</Label>
            <div className="flex gap-2">
              <Button
                variant={context === 'ar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {}}
                disabled
              >
                Arabic
              </Button>
              <Button
                variant={context === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {}}
                disabled
              >
                English
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Language selection will be available in full version
            </p>
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={isLoading || !aiEnabled || !prompt.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate with AI
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-blue-900 dark:text-blue-100">Result</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {result}
              </p>
            </div>
            {onResult && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onResult(result)}
                className="w-full"
              >
                Use This Result
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
