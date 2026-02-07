'use client'

import { useState } from 'react'
import { useAlerts } from '@/context/alert-context'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings } from 'lucide-react'

export default function ConfigPanel() {
  const { backendUrl, setBackendUrl } = useAlerts()
  const [tempUrl, setTempUrl] = useState(backendUrl)
  const [open, setOpen] = useState(false)

  const handleSave = () => {
    if (tempUrl.trim()) {
      setBackendUrl(tempUrl)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Configuration</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Backend Configuration</DialogTitle>
          <DialogDescription>
            Configure the FastAPI backend URL for alert analysis and WebSocket streaming.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="backend-url">Backend URL</Label>
            <Input
              id="backend-url"
              placeholder="http://localhost:8000"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              This URL is used for both POST /analyze requests and WebSocket /alerts connections.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Configuration</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
