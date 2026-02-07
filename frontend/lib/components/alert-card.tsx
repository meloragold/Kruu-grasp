'use client'

import { Alert } from '@/context/alert-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, AlertTriangle, Users, Zap } from 'lucide-react'

interface AlertCardProps {
  alert: Alert
}

export default function AlertCard({ alert }: AlertCardProps) {
  const getUrgencyColor = (score: number) => {
    if (score >= 30) return { bg: 'bg-red-950/30', border: 'border-red-500/50', text: 'text-red-400' }
    if (score >= 15) return { bg: 'bg-yellow-950/30', border: 'border-yellow-500/50', text: 'text-yellow-400' }
    return { bg: 'bg-green-950/30', border: 'border-green-500/50', text: 'text-green-400' }
  }

  const colors = getUrgencyColor(alert.urgency_score)

  return (
    <Card className={`${colors.bg} border-l-4 ${colors.border}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <CardTitle className="line-clamp-2 text-base">{alert.message}</CardTitle>
            {alert.location.length > 0 && (
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {alert.location.join(', ')}
                {alert.location_confidence === 'low' && <span className="text-xs">(low confidence)</span>}
              </CardDescription>
            )}
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-lg font-bold ${colors.text}`}>
            {alert.urgency_score}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* People Affected */}
        {alert.people_affected > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{alert.people_affected}</span>
            <span className="text-muted-foreground">people affected</span>
          </div>
        )}

        {/* Detected Needs */}
        {alert.needs.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Detected Needs</p>
            <div className="flex flex-wrap gap-2">
              {alert.needs.map((need) => (
                <Badge key={need} variant="outline" className="capitalize">
                  {need}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Matched Resources */}
        {alert.matched_resources.length > 0 && (
          <div className="space-y-2">
            <p className="flex items-center gap-1 text-xs font-semibold uppercase text-muted-foreground">
              <Zap className="h-3 w-3" />
              Matched Resources
            </p>
            <div className="space-y-1">
              {alert.matched_resources.map((resource, idx) => (
                <div key={idx} className="flex items-center justify-between rounded bg-background/50 px-2 py-1 text-xs">
                  <div>
                    <p className="font-medium">{resource.name}</p>
                    <p className="text-muted-foreground">{resource.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                      resource.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {resource.status}
                    </span>
                    <span className="text-muted-foreground">{resource.eta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resource Reasoning */}
        {alert.resource_log && (
          <div className="space-y-2 rounded bg-background/50 p-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Matching Logic</p>
            <p className="text-xs text-muted-foreground line-clamp-3">{alert.resource_log}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
