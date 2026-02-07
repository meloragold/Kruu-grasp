'use client'

import React from "react"

import { useState } from 'react'
import { useAlerts } from '@/context/alert-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader } from 'lucide-react'
import axios from 'axios'
import AlertCard from '@/components/alert-card'

export default function AlertSubmissionScreen() {
  const { backendUrl, addAlert } = useAlerts()
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) {
      setError('Please enter an alert message')
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('[v0] Submitting alert to:', backendUrl)
      const response = await axios.post(`${backendUrl}/analyze`, {
        text: message,
      })

      console.log('[v0] Alert response:', response.data)

      const alert = {
        id: Date.now().toString(),
        message,
        ...response.data,
      }

      addAlert(alert)
      setResult(alert)
      setMessage('')
    } catch (err: any) {
      console.error('[v0] Error submitting alert:', err)
      setError(err.response?.data?.detail || err.message || 'Failed to analyze alert')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Submit Alert for Analysis</CardTitle>
          <CardDescription>
            Describe the emergency situation in detail. The system will automatically extract urgency, location, needs, and available resources.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Describe the emergency situation (e.g., 'Building fire on Main Street, multiple people trapped on 3rd floor, need immediate fire department and medical assistance')..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="resize-none"
            />

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-500">
                {error}
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Alert'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Result Preview */}
      {result && (
        <div>
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase">
            Analysis Result
          </h3>
          <AlertCard alert={result} />
        </div>
      )}
    </div>
  )
}
