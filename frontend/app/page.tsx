'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Home, Send, Radio, Package, ImageIcon } from 'lucide-react'
import { AlertProvider } from '@/context/alert-context'
import HomeScreen from '@/components/screens/home-screen'
import AlertSubmissionScreen from '@/components/screens/alert-submission-screen'
import LiveAlertsScreen from '@/components/screens/live-alerts-screen'
import ResourcesScreen from '@/components/screens/resources-screen'
import ImageUploadScreen from '@/components/screens/image-upload-screen'
import ConfigPanel from '@/components/config-panel'
import { ThemeToggle } from '@/components/theme-toggle'

function PageContent() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <h1 className="text-xl font-bold text-foreground">Emergency Alert System</h1>
          </div>
          <div className="flex items-center gap-4">
            <ConfigPanel />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
          <TabsList className="m-4 grid w-fit grid-cols-5 gap-1">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </TabsTrigger>
            <TabsTrigger value="submit" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Submit</span>
            </TabsTrigger>
            <TabsTrigger value="live" className="flex items-center gap-2">
              <Radio className="h-4 w-4" />
              <span className="hidden sm:inline">Live</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Resources</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="flex-1 overflow-auto">
            <HomeScreen />
          </TabsContent>
          <TabsContent value="submit" className="flex-1 overflow-auto">
            <AlertSubmissionScreen />
          </TabsContent>
          <TabsContent value="live" className="flex-1 overflow-auto">
            <LiveAlertsScreen />
          </TabsContent>
          <TabsContent value="resources" className="flex-1 overflow-auto">
            <ResourcesScreen />
          </TabsContent>
          <TabsContent value="upload" className="flex-1 overflow-auto">
            <ImageUploadScreen />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <AlertProvider>
      <PageContent />
    </AlertProvider>
  )
}
