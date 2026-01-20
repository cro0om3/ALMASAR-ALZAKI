"use client"

import { Minus, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
  showButtons?: boolean
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
  className,
  showButtons = true,
}: NumberInputProps) {
  const handleIncrement = () => {
    const newValue = value + step
    if (max === undefined || newValue <= max) {
      onChange(newValue)
    }
  }

  const handleDecrement = () => {
    const newValue = value - step
    if (min === undefined || newValue >= min) {
      onChange(newValue)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0
    if (min !== undefined && newValue < min) {
      onChange(min)
    } else if (max !== undefined && newValue > max) {
      onChange(max)
    } else {
      onChange(newValue)
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showButtons && (
        <Button
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={disabled || (min !== undefined && value <= min)}
          className="h-10 w-10"
        >
          <Minus className="h-4 w-4" />
        </Button>
      )}
      <Input
        type="number"
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="text-center"
      />
      {showButtons && (
        <Button
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && value >= max)}
          className="h-10 w-10"
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
