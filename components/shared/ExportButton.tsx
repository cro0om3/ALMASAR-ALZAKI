"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileSpreadsheet, FileText, File } from "lucide-react"
import { exportToExcel, exportToWord, exportToPDF, ExportData } from "@/lib/utils/export-utils"
import { useToast } from "@/lib/hooks/use-toast"
import { PrintButton } from "./PrintButton"

interface ExportButtonProps {
  data: ExportData
  filename: string
  variant?: "default" | "gold" | "outline"
  className?: string
}

export function ExportButton({ data, filename, variant = "gold", className }: ExportButtonProps) {
  const { toast } = useToast()

  const handleExport = async (type: 'excel' | 'word' | 'pdf') => {
    try {
      switch (type) {
        case 'excel':
          exportToExcel(data, filename)
          toast({
            title: "Export Successful",
            description: "Document exported to Excel successfully",
          })
          break
        case 'word':
          exportToWord(data, filename)
          toast({
            title: "Export Successful",
            description: "Document exported to Word successfully",
          })
          break
        case 'pdf':
          exportToPDF(data, filename)
          toast({
            title: "Export Successful",
            description: "Document exported to PDF successfully",
          })
          break
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export document. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          className={className || (variant === "gold" 
            ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 dark:from-yellow-500 dark:via-yellow-600 dark:to-yellow-700 text-blue-900 dark:text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 dark:hover:from-yellow-600 dark:hover:via-yellow-700 dark:hover:to-yellow-800 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 dark:border-yellow-500/50 px-6 py-3"
            : variant === "outline"
            ? "border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-500 dark:hover:border-blue-600 font-semibold px-6 py-3"
            : "px-6 py-3"
          )}
        >
          <Download className="mr-2 h-5 w-5" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export to Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('word')}>
          <FileText className="mr-2 h-4 w-4" />
          Export to Word
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <File className="mr-2 h-4 w-4" />
          Export to PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
