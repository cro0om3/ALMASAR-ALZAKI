"use client"

import { useState } from "react"
import { Download, Upload, Database, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/lib/hooks/use-toast"

export function DataBackup() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const { toast } = useToast()

  const exportData = () => {
    setIsExporting(true)
    try {
      const data: Record<string, any> = {}
      
      // Export all data from localStorage
      const keys = [
        'quotations',
        'invoices',
        'purchaseOrders',
        'customers',
        'vendors',
        'vehicles',
        'employees',
        'payslips',
        'receipts',
        'projects',
        'usageEntries',
        'monthlyInvoices',
        'appSettings',
        'notifications',
      ]

      keys.forEach(key => {
        const item = localStorage.getItem(key)
        if (item) {
          try {
            data[key] = JSON.parse(item)
          } catch (e) {
            data[key] = item
          }
        }
      })

      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `crm-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Backup Successful",
        description: "All data has been exported successfully",
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const importData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      setIsImporting(true)
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string)
          
          // Import all data to localStorage
          Object.keys(data).forEach(key => {
            localStorage.setItem(key, JSON.stringify(data[key]))
          })

          toast({
            title: "Import Successful",
            description: "All data has been imported successfully. Please refresh the page.",
            variant: "success",
          })

          // Reload after a short delay
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "Invalid backup file. Please check the file and try again.",
            variant: "destructive",
          })
        } finally {
          setIsImporting(false)
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <Card className="border-2 border-blue-200/60 dark:border-blue-800/60 shadow-card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">
              Data Backup & Restore
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Export or import all your CRM data
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Button
            onClick={exportData}
            disabled={isExporting || isImporting}
            variant="default"
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>
          <Button
            onClick={importData}
            disabled={isExporting || isImporting}
            variant="outline"
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isImporting ? 'Importing...' : 'Import Data'}
          </Button>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>• Export: Download all your data as a JSON file</p>
          <p>• Import: Restore data from a previously exported backup file</p>
          <p className="text-yellow-600 dark:text-yellow-400 font-semibold">
            ⚠️ Importing will replace all current data
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
