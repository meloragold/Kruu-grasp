'use client'

import { useEffect, useState } from 'react'
import { useAlerts } from '@/context/alert-context'
import AlertCard from '@/components/alert-card'
import { Loader } from 'lucide-react'

export default function LiveAlertsScreen() {
  const { alerts, backendUrl, addAlert, setIsConnected } = useAlerts()
  const [isConnecting, setIsConnecting] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ws: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout

    const connectWebSocket = () => {
      try {
        const wsUrl = backendUrl.replace('http', 'ws') + '/alerts'
        console.log('[v0] Connecting to WebSocket:', wsUrl)

        ws = new WebSocket(wsUrl)

        ws.onopen = () => {
          console.log('[v0] WebSocket connected')
          setIsConnecting(false)
          setIsConnected(true)
          setError(null)
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log('[v0] Received alert:', data)
            addAlert(data)
          } catch (e) {
            console.error('[v0] Error parsing alert data:', e)
          }
        }

        ws.onerror = (event) => {
          console.error('[v0] WebSocket error:', event)
          setError('Failed to connect to alerts stream')
          setIsConnecting(false)
        }

        ws.onclose = () => {
          console.log('[v0] WebSocket disconnected')
          setIsConnected(false)
          setIsConnecting(true)
          // Attempt to reconnect after 3 seconds
          reconnectTimeout = setTimeout(() => {
            console.log('[v0] Attempting to reconnect...')
            connectWebSocket()
          }, 3000)
        }
      } catch (e) {
        console.error('[v0] WebSocket connection error:', e)
        setError('Failed to connect to alerts stream')
        setIsConnecting(false)
      }
    }

    connectWebSocket()

    return () => {
      if (ws) {
        ws.close()
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
    }
  }, [backendUrl, addAlert, setIsConnected])

  const sortedAlerts = [...alerts].sort((a, b) => b.urgency_score - a.urgency_score)

  return (
    <div className="space-y-4 p-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-background/50 p-4">
        <div className="flex items-center gap-2">
          <div
            className={`h-3 w-3 rounded-full ${isConnecting ? 'bg-yellow-500' : error ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}
          />
          <span className="text-sm font-medium">
            {isConnecting ? 'Connecting...' : error ? 'Connection Failed' : 'Connected to Live Alerts'}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{alerts.length} active</span>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-500">
          <p>{error}</p>
          <p className="mt-2 text-xs text-muted-foreground">Make sure FastAPI is running at {backendUrl}</p>
        </div>
      )}

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border">
          <Loader className="mb-4 h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Waiting for incoming alerts...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  )
}
