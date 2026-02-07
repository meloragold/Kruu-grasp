'use client'

import { useAlerts } from '@/context/alert-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ResourcesScreen() {
  const { alerts } = useAlerts()

  // Build resource entries with alert context
  const resourceEntries = alerts.flatMap((alert) =>
    alert.matched_resources.map((resource) => ({
      alertMessage: alert.message,
      resourceName: resource.name,
      type: resource.type,
      eta: resource.eta,
      status: resource.status,
      resourceLog: alert.resource_log || 'No log available',
    }))
  )

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Deployed Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold">Alert Message</th>
                  <th className="px-4 py-3 text-left font-semibold">Resource Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-left font-semibold">ETA</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Resource Log / Explanation</th>
                </tr>
              </thead>
              <tbody>
                {resourceEntries.map((entry, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3 max-w-xs">
                      <span className="line-clamp-2 text-foreground">{entry.alertMessage}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{entry.resourceName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{entry.type}</td>
                    <td className="px-4 py-3 text-muted-foreground">{entry.eta}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex whitespace-nowrap rounded px-2 py-1 text-xs font-medium ${
                          entry.status === 'active'
                            ? 'bg-green-500/20 text-green-500'
                            : entry.status === 'available'
                              ? 'bg-blue-500/20 text-blue-500'
                              : 'bg-yellow-500/20 text-yellow-500'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs max-w-md">
                      <span className="line-clamp-2">{entry.resourceLog}</span>
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
