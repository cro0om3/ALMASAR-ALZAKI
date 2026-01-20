"use client"

import { HelpCircle } from "lucide-react"
import { Tooltip as TooltipComponent } from "./Tooltip"

interface HelpTooltipProps {
  content: string
  className?: string
}

export function HelpTooltip({ content, className }: HelpTooltipProps) {
  return (
    <TooltipComponent content={content}>
      <HelpCircle className={`h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help ${className}`} />
    </TooltipComponent>
  )
}
