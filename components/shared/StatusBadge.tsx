"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  showIcon?: boolean
  className?: string
}

export function StatusBadge({ status, showIcon = true, className }: StatusBadgeProps) {
  const statusConfig: Record<
    string,
    {
      variant: "default" | "secondary" | "success" | "destructive" | "warning"
      label: string
      icon?: React.ReactNode
    }
  > = {
    // Invoice statuses
    paid: {
      variant: "success",
      label: "Paid",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    sent: {
      variant: "default",
      label: "Sent",
      icon: <Clock className="h-3 w-3" />,
    },
    overdue: {
      variant: "destructive",
      label: "Overdue",
      icon: <AlertCircle className="h-3 w-3" />,
    },
    draft: {
      variant: "secondary",
      label: "Draft",
      icon: <Clock className="h-3 w-3" />,
    },
    cancelled: {
      variant: "destructive",
      label: "Cancelled",
      icon: <XCircle className="h-3 w-3" />,
    },
    // Quotation statuses
    accepted: {
      variant: "success",
      label: "Accepted",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    rejected: {
      variant: "destructive",
      label: "Rejected",
      icon: <XCircle className="h-3 w-3" />,
    },
    expired: {
      variant: "warning",
      label: "Expired",
      icon: <AlertCircle className="h-3 w-3" />,
    },
    // Purchase Order statuses
    pending: {
      variant: "default",
      label: "Pending",
      icon: <Clock className="h-3 w-3" />,
    },
    approved: {
      variant: "success",
      label: "Approved",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    completed: {
      variant: "success",
      label: "Completed",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    received: {
      variant: "success",
      label: "Received",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    // Payslip statuses
    issued: {
      variant: "default",
      label: "Issued",
      icon: <Clock className="h-3 w-3" />,
    },
    // Employee statuses
    active: {
      variant: "success",
      label: "Active",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    inactive: {
      variant: "secondary",
      label: "Inactive",
      icon: <XCircle className="h-3 w-3" />,
    },
    terminated: {
      variant: "destructive",
      label: "Terminated",
      icon: <XCircle className="h-3 w-3" />,
    },
  }

  const config = statusConfig[status.toLowerCase()] || {
    variant: "secondary" as const,
    label: status,
  }

  return (
    <Badge
      variant={config.variant}
      className={cn("flex items-center gap-1", className)}
    >
      {showIcon && config.icon && <span>{config.icon}</span>}
      <span>{config.label}</span>
    </Badge>
  )
}
