'use client'

import { useAlerts } from '@/context/alert-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomeScreen() {
  const { alerts } = useAlerts()

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return 'N/A'
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const getUrgencyColor = (score: number) => {
    if (score >= 30) return '#ef4444'
    if (score >= 15) return '#eab308'
    return '#22c55e'
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Resource Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold">Timestamp</th>
                  <th className="px-4 py-3 text-left font-semibold">Message</th>
                  <th className="px-4 py-3 text-center font-semibold">Urgency</th>
                  <th className="px-4 py-3 text-left font-semibold">Location</th>
                  <th className="px-4 py-3 text-left font-semibold">Location Confidence</th>
                  <th className="px-4 py-3 text-center font-semibold">People Affected</th>
                  <th className="px-4 py-3 text-left font-semibold">Needs</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatTime(alert.timestamp)}</td>
                    <td className="px-4 py-3 font-medium max-w-sm">
                      <span className="line-clamp-2">{alert.message}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className="inline-flex h-7 w-7 items-center justify-center rounded text-xs font-bold text-white"
                        style={{ backgroundColor: getUrgencyColor(alert.urgency_score) }}
                      >
                        {alert.urgency_score}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {alert.location.length > 0 ? alert.location.join(', ') : 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">
                      {alert.location_confidence || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-center text-foreground font-medium">
                      {alert.people_affected > 0 ? alert.people_affected : 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {alert.needs.length > 0 ? alert.needs.join(', ') : 'None'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
