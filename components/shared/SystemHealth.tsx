"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertTriangle, Activity } from "lucide-react"
import { useState, useEffect } from "react"

interface HealthStatus {
  status: 'healthy' | 'warning' | 'error'
  message: string
  details?: string
}

export function SystemHealth() {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'healthy',
    message: 'All systems operational',
  })

  useEffect(() => {
    const checkHealth = () => {
      try {
        // Check localStorage availability
        if (typeof window === 'undefined' || !window.localStorage) {
          setHealth({
            status: 'error',
            message: 'LocalStorage not available',
            details: 'Data persistence may not work correctly',
          })
          return
        }

        // Check storage quota
        try {
          const testKey = '__storage_test__'
          localStorage.setItem(testKey, 'test')
          localStorage.removeItem(testKey)
        } catch (e: any) {
          if (e.name === 'QuotaExceededError') {
            setHealth({
              status: 'warning',
              message: 'Storage quota nearly full',
              details: 'Consider cleaning up old data',
            })
            return
          }
        }

        // Check data integrity
        const requiredKeys = [
          'appSettings',
          'customers',
          'quotations',
          'invoices',
        ]

        const missingKeys = requiredKeys.filter(key => !localStorage.getItem(key))
        if (missingKeys.length > 0) {
          setHealth({
            status: 'warning',
            message: 'Some data may be missing',
            details: `Missing: ${missingKeys.join(', ')}`,
          })
          return
        }

        setHealth({
          status: 'healthy',
          message: 'All systems operational',
        })
      } catch (error) {
        setHealth({
          status: 'error',
          message: 'Health check failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = () => {
    switch (health.status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
    }
  }

  const getStatusBadge = () => {
    switch (health.status) {
      case 'healthy':
        return <Badge variant="success" className="text-xs">Healthy</Badge>
      case 'warning':
        return <Badge variant="warning" className="text-xs">Warning</Badge>
      case 'error':
        return <Badge variant="destructive" className="text-xs">Error</Badge>
    }
  }

  return (
    <Card className="border-2 border-blue-200/60 dark:border-blue-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <Activity className="h-5 w-5 text-gold dark:text-yellow-400" />
            System Health
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div className="flex-1">
            <p className="font-semibold text-blue-900 dark:text-blue-100">{health.message}</p>
            {health.details && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{health.details}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
