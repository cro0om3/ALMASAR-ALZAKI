"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ReactNode } from "react"

interface CardGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CardGrid({
  children,
  columns = 3,
  gap = 'md',
  className,
}: CardGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
    5: 'md:grid-cols-3 lg:grid-cols-5',
    6: 'md:grid-cols-3 lg:grid-cols-6',
  }

  const gaps = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  }

  return (
    <div className={`grid ${gridCols[columns]} ${gaps[gap]} ${className}`}>
      {children}
    </div>
  )
}

interface GridCardProps {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  onClick?: () => void
  className?: string
  variant?: 'default' | 'highlighted'
}

export function GridCard({
  title,
  description,
  children,
  footer,
  onClick,
  className,
  variant = 'default',
}: GridCardProps) {
  const variantClasses = {
    default: 'border-blue-400 dark:border-blue-800/60 shadow-card hover:shadow-card-hover',
    highlighted: 'border-gold/60 dark:border-gold/40 shadow-gold hover:shadow-lg bg-gradient-to-br from-gold/10 to-yellow-50 dark:from-gold/20 dark:to-blue-900/30',
  }

  return (
    <Card
      className={`${variantClasses[variant]} transition-all duration-300 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="dark:text-gray-400">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      {footer && (
        <div className="px-6 pb-6">
          {footer}
        </div>
      )}
    </Card>
  )
}
