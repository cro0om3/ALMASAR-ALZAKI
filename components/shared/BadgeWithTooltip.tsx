"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip } from "./Tooltip"
import { VariantProps } from "class-variance-authority"

interface BadgeWithTooltipProps extends VariantProps<typeof Badge> {
  children: React.ReactNode
  tooltip?: string | React.ReactNode
  tooltipSide?: "top" | "bottom" | "left" | "right"
}

export function BadgeWithTooltip({
  children,
  tooltip,
  tooltipSide = "top",
  ...badgeProps
}: BadgeWithTooltipProps) {
  if (!tooltip) {
    return <Badge {...badgeProps}>{children}</Badge>
  }

  return (
    <Tooltip content={tooltip} position={tooltipSide}>
      <Badge {...badgeProps}>{children}</Badge>
    </Tooltip>
  )
}
