'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface Alert {
  id: string
  message: string
  urgency_score: number
  location: string[]
  location_confidence: 'high' | 'low'
  needs: string[]
  people_affected: number
  matched_resources: Array<{
    name: string
    type: string
    eta: string
    status: string
  }>
  resource_log: string
  timestamp?: number
}

interface AlertContextType {
  alerts: Alert[]
  backendUrl: string
  setBackendUrl: (url: string) => void
  addAlert: (alert: Alert) => void
  clearAlerts: () => void
  getAlertStats: () => { red: number; yellow: number; green: number }
  isConnected: boolean
  setIsConnected: (connected: boolean) => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [backendUrl, setBackendUrl] = useState('http://localhost:8000')
  const [isConnected, setIsConnected] = useState(false)

  const addAlert = useCallback((alert: Alert) => {
    setAlerts((prev) => [
      { ...alert, id: alert.id || Date.now().toString(), timestamp: Date.now() },
      ...prev,
    ])
  }, [])

  const clearAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  const getAlertStats = useCallback(() => {
    return {
      red: alerts.filter((a) => a.urgency_score >= 30).length,
      yellow: alerts.filter((a) => a.urgency_score >= 15 && a.urgency_score < 30).length,
      green: alerts.filter((a) => a.urgency_score < 15).length,
    }
  }, [alerts])

  return (
    <AlertContext.Provider
      value={{
        alerts,
        backendUrl,
        setBackendUrl,
        addAlert,
        clearAlerts,
        getAlertStats,
        isConnected,
        setIsConnected,
      }}
    >
      {children}
    </AlertContext.Provider>
  )
}

export function useAlerts() {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlerts must be used within AlertProvider')
  }
  return context
}
