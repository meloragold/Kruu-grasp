'use client'

import React from "react"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, ImageIcon } from 'lucide-react'

export default function ImageUploadScreen() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith('image/'))

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setUploadedImages((prev) => [...prev, event.target.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setUploadedImages((prev) => [...prev, event.target.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Location Image Upload</CardTitle>
          <CardDescription>
            Upload images from emergency locations to assist with resource allocation and situation assessment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-lg border-2 border-dashed transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border'
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-12">
              <div className="rounded-lg bg-muted p-3">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">Drag and drop images here</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="absolute cursor-pointer opacity-0"
                style={{ width: 1, height: 1 }}
                id="file-input"
              />
              <Button asChild>
                <label htmlFor="file-input" className="cursor-pointer">
                  Select Images
                </label>
              </Button>
            </div>
          </div>

          {/* Uploaded Images */}
          {uploadedImages.length > 0 && (
            <div>
              <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase">
                {uploadedImages.length} Image{uploadedImages.length !== 1 ? 's' : ''} Uploaded
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {uploadedImages.map((image, idx) => (
                  <div key={idx} className="relative overflow-hidden rounded-lg border border-border">
                    <img src={image || "/placeholder.svg"} alt={`Uploaded ${idx + 1}`} className="h-40 w-full object-cover" />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => setUploadedImages((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadedImages.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 py-8 text-center">
              <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No images uploaded yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Future Enhancement</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Image analysis will be integrated to automatically extract location information, assess scene severity, and improve resource matching accuracy.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
