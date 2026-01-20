"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/lib/hooks/use-toast"
import { cn } from "@/lib/utils"

interface CopyButtonProps {
  text: string
  label?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showLabel?: boolean
}

export function CopyButton({
  text,
  label = "Copy",
  variant = "ghost",
  size = "icon",
  className,
  showLabel = false,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
        variant: "success",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn("gap-2", className)}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          {showLabel && "Copied!"}
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          {showLabel && label}
        </>
      )}
    </Button>
  )
}
