import axios, { AxiosInstance } from 'axios'

export interface AnalysisResponse {
  urgency_score: number
  location: string[]
  matched_resources: Resource[]
  message: string
}

export interface Resource {
  name: string
  type: string
  eta: string
  status: string
}

export interface Alert {
  id?: string
  urgency_score: number
  location: string[]
  matched_resources: Resource[]
  message: string
  timestamp?: number
}

let axiosInstance: AxiosInstance | null = null

export function initializeApiClient(baseURL: string): AxiosInstance {
  axiosInstance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return axiosInstance
}

export function getApiClient(): AxiosInstance {
  if (!axiosInstance) {
    const baseURL = localStorage.getItem('apiBaseURL') || 'http://localhost:8000'
    initializeApiClient(baseURL)
  }
  return axiosInstance!
}

export async function analyzeAlert(text: string): Promise<AnalysisResponse> {
  const client = getApiClient()
  const response = await client.post<AnalysisResponse>('/analyze', { text })
  return response.data
}

export function getWebSocketURL(baseURL: string): string {
  const wsProtocol = baseURL.startsWith('https') ? 'wss' : 'ws'
  const cleanURL = baseURL.replace(/^https?:\/\//, '')
  return `${wsProtocol}://${cleanURL}/alerts`
}

export function connectWebSocket(
  baseURL: string,
  onMessage: (alert: Alert) => void,
  onError?: (error: Event) => void,
  onClose?: (event: CloseEvent) => void
): WebSocket {
  const wsURL = getWebSocketURL(baseURL)
  const ws = new WebSocket(wsURL)

  ws.onmessage = (event) => {
    try {
      const alert = JSON.parse(event.data) as Alert
      alert.timestamp = Date.now()
      onMessage(alert)
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }

  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
    onError?.(error)
  }

  ws.onclose = (event) => {
    console.log('WebSocket closed:', event.code, event.reason)
    onClose?.(event)
  }

  return ws
}
