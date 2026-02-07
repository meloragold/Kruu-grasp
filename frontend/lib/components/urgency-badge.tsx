import React from "react"
import { Badge } from '@/components/ui/badge'

interface UrgencyBadgeProps {
  score: number
  className?: string
}

export function UrgencyBadge({ score, className = '' }: UrgencyBadgeProps) {
  const getUrgencyLevel = (score: number) => {
    if (score >= 30) return { label: 'Critical', variant: 'destructive' as const }
    if (score >= 15) return { label: 'Warning', variant: 'secondary' as const }
    return { label: 'Low', variant: 'outline' as const }
  }

  const urgency = getUrgencyLevel(score)

  return (
    <div className={className}>
      <Badge variant={urgency.variant}>
        {urgency.label} ({score})
      </Badge>
    </div>
  )
}

interface UrgencyBackgroundProps {
  score: number
  children: React.ReactNode
  className?: string
}

export function UrgencyBackground({ score, children, className = '' }: UrgencyBackgroundProps) {
  const getBackgroundColor = (score: number) => {
    if (score >= 30) return 'bg-red-500/10 border-red-500/50'
    if (score >= 15) return 'bg-yellow-500/10 border-yellow-500/50'
    return 'bg-green-500/10 border-green-500/50'
  }

  return (
    <div className={`${getBackgroundColor(score)} rounded-lg border p-4 ${className}`}>
      {children}
    </div>
  )
}
