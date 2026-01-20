import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface PageHeaderProps {
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
  actionIcon?: ReactNode
  onActionClick?: () => void
}

export function PageHeader({
  title,
  description,
  actionLabel,
  actionHref,
  actionIcon,
  onActionClick,
}: PageHeaderProps) {
  const actionButton = actionLabel && (
    actionHref ? (
      <Link href={actionHref}>
        <Button 
          variant="gold"
          size="lg"
          className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 px-6 py-3 min-w-[160px]"
        >
          {actionIcon || <Plus className="mr-2 h-5 w-5" />}
          {actionLabel}
        </Button>
      </Link>
    ) : onActionClick ? (
      <Button 
        onClick={onActionClick}
        variant="gold"
        size="lg"
        className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 px-6 py-3 min-w-[160px]"
      >
        {actionIcon || <Plus className="mr-2 h-5 w-5" />}
        {actionLabel}
      </Button>
    ) : null
  )

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-8 md:p-10 rounded-2xl shadow-luxury">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 to-transparent"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold/20 rounded-full blur-2xl"></div>
      <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">{title}</h1>
          {description && (
            <p className="text-blue-100 dark:text-blue-200 text-lg font-medium">{description}</p>
          )}
        </div>
        {actionButton}
      </div>
    </div>
  )
}
