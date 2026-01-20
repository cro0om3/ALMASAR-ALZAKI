import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export function formatDateForInvoice(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d).split('/').reverse().join('-')
}

// Convert number to words (for amount in words)
export function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  
  function convertHundreds(n: number): string {
    if (n === 0) return ''
    let result = ''
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred '
      n %= 100
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' '
      n %= 10
    }
    if (n >= 10) {
      result += teens[n - 10] + ' '
      n = 0
    }
    if (n > 0) {
      result += ones[n] + ' '
    }
    return result.trim()
  }
  
  if (num === 0) return 'Zero Dirhams'
  
  const integerPart = Math.floor(num)
  const decimalPart = Math.round((num - integerPart) * 100)
  
  let words = ''
  let remaining = integerPart
  
  if (remaining >= 1000000) {
    const millions = Math.floor(remaining / 1000000)
    words += convertHundreds(millions) + ' Million '
    remaining %= 1000000
  }
  if (remaining >= 1000) {
    const thousands = Math.floor(remaining / 1000)
    words += convertHundreds(thousands) + ' Thousand '
    remaining %= 1000
  }
  if (remaining > 0) {
    words += convertHundreds(remaining)
  }
  
  words = words.trim()
  
  if (decimalPart > 0) {
    words += ` & ${decimalPart}/100`
  }
  
  return words + (words ? ' Dirhams' : '')
}

// Calculate days remaining until expiry date
export function calculateDaysRemaining(expiryDate?: string): number {
  if (!expiryDate) return Infinity
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  
  const diffTime = expiry.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

// Get residence status based on expiry date
export function getResidenceStatus(expiryDate?: string): 'expired' | 'critical' | 'warning' | 'ok' {
  if (!expiryDate) return 'ok'
  
  const daysRemaining = calculateDaysRemaining(expiryDate)
  
  if (daysRemaining < 0) {
    return 'expired'
  } else if (daysRemaining <= 7) {
    return 'critical'
  } else if (daysRemaining <= 30) {
    return 'warning'
  } else {
    return 'ok'
  }
}