// AI Service using OpenAI API

interface AIRequest {
  prompt: string
  maxTokens?: number
  temperature?: number
}

interface AIResponse {
  text: string
  error?: string
}

class AIService {
  private apiKey: string | null = null
  private enabled: boolean = false

  constructor() {
    if (typeof window !== 'undefined') {
      const settings = localStorage.getItem('appSettings')
      if (settings) {
        try {
          const parsed = JSON.parse(settings)
          this.apiKey = parsed.openAIApiKey || null
          this.enabled = parsed.aiEnabled || false
        } catch (error) {
          console.error('Error loading AI settings:', error)
        }
      }
    }
  }

  setApiKey(key: string) {
    this.apiKey = key
    if (typeof window !== 'undefined') {
      const settings = JSON.parse(localStorage.getItem('appSettings') || '{}')
      settings.openAIApiKey = key
      localStorage.setItem('appSettings', JSON.stringify(settings))
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
    if (typeof window !== 'undefined') {
      const settings = JSON.parse(localStorage.getItem('appSettings') || '{}')
      settings.aiEnabled = enabled
      localStorage.setItem('appSettings', JSON.stringify(settings))
    }
  }

  isEnabled(): boolean {
    return this.enabled && !!this.apiKey
  }

  async generateText(request: AIRequest): Promise<AIResponse> {
    if (!this.isEnabled()) {
      return {
        text: '',
        error: 'AI is not enabled or API key is missing',
      }
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: request.prompt,
            },
          ],
          max_tokens: request.maxTokens || 500,
          temperature: request.temperature || 0.7,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        return {
          text: '',
          error: error.error?.message || 'Failed to generate text',
        }
      }

      const data = await response.json()
      return {
        text: data.choices[0]?.message?.content || '',
      }
    } catch (error) {
      return {
        text: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Specific AI functions for common tasks

  async generateProductDescription(productName: string, category?: string): Promise<string> {
    const prompt = `Write a professional product description in Arabic and English for: ${productName}${category ? ` (Category: ${category})` : ''}. Make it concise, clear, and marketing-focused.`
    const response = await this.generateText({ prompt, maxTokens: 200 })
    return response.text || ''
  }

  async generateInvoiceNote(customerName: string, amount: number): Promise<string> {
    const prompt = `Generate a professional invoice note in Arabic for customer: ${customerName}, amount: ${amount}. Include payment terms and thank you message. Keep it brief.`
    const response = await this.generateText({ prompt, maxTokens: 150 })
    return response.text || ''
  }

  async translateText(text: string, targetLanguage: 'ar' | 'en'): Promise<string> {
    const language = targetLanguage === 'ar' ? 'Arabic' : 'English'
    const prompt = `Translate the following text to ${language}. Only provide the translation, no explanations: ${text}`
    const response = await this.generateText({ prompt, maxTokens: 300 })
    return response.text || text
  }

  async generateQuotationTerms(serviceType: string, duration?: string): Promise<string> {
    const prompt = `Generate professional quotation terms and conditions in Arabic for ${serviceType} service${duration ? ` with duration of ${duration}` : ''}. Include validity period, payment terms, and general conditions.`
    const response = await this.generateText({ prompt, maxTokens: 300 })
    return response.text || ''
  }

  async analyzeSalesData(salesData: string): Promise<string> {
    const prompt = `Analyze the following sales data and provide insights in Arabic: ${salesData}. Provide key observations and suggestions for improvement.`
    const response = await this.generateText({ prompt, maxTokens: 400 })
    return response.text || ''
  }

  async generateEmailResponse(customerQuery: string, context?: string): Promise<string> {
    const prompt = `Write a professional email response in Arabic for a customer inquiry. Query: ${customerQuery}${context ? `\nContext: ${context}` : ''}. Be polite, helpful, and concise.`
    const response = await this.generateText({ prompt, maxTokens: 300 })
    return response.text || ''
  }

  async suggestPrice(productDescription: string, marketContext?: string): Promise<string> {
    const prompt = `Based on the following product description, suggest an appropriate price in AED. Product: ${productDescription}${marketContext ? `\nMarket context: ${marketContext}` : ''}. Provide reasoning in Arabic.`
    const response = await this.generateText({ prompt, maxTokens: 200 })
    return response.text || ''
  }

  async generateSummary(text: string, maxLength?: number): Promise<string> {
    const maxWords = maxLength || 50
    const prompt = `Summarize the following text in Arabic in maximum ${maxWords} words: ${text}`
    const response = await this.generateText({ prompt, maxTokens: 200 })
    return response.text || text
  }

  // Analyze payment image (check, receipt, etc.) using OpenAI Vision API
  async analyzePaymentImage(imageBase64: string): Promise<{
    amount?: number
    date?: string
    referenceNumber?: string
    bankName?: string
    paymentMethod?: string
    error?: string
  }> {
    if (!this.isEnabled()) {
      return {
        error: 'AI is not enabled or API key is missing',
      }
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o', // Use vision-capable model
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this payment image (check, receipt, or bank transfer). Extract the following information in JSON format:
{
  "amount": number (the payment amount),
  "date": "YYYY-MM-DD" (payment date if visible),
  "referenceNumber": "string" (check number, transaction ID, or reference number),
  "bankName": "string" (bank name if visible),
  "paymentMethod": "cheque" | "bank_transfer" | "credit_card" | "cash" | "other"
}
Only include fields that are clearly visible in the image. Return only valid JSON, no additional text.`,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 500,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        return {
          error: error.error?.message || 'Failed to analyze image',
        }
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content || '{}'
      
      try {
        const parsed = JSON.parse(content)
        return parsed
      } catch (parseError) {
        // Try to extract JSON from the response if it's wrapped in text
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          return parsed
        }
        return {
          error: 'Failed to parse AI response',
        }
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

export const aiService = new AIService()
