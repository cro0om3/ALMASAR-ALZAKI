"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, X, Upload, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

interface CameraCaptureProps {
  onCapture: (file: File) => void
  onCancel?: () => void
  label?: string
  accept?: string
}

export function CameraCapture({ 
  onCapture, 
  onCancel, 
  label = "Take Photo",
  accept = "image/*"
}: CameraCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCapturing(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Unable to access camera. Please check permissions.")
      // Fallback to file input
      fileInputRef.current?.click()
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCapturing(false)
    setPreview(null)
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
            const previewUrl = URL.createObjectURL(blob)
            setPreview(previewUrl)
            stopCamera()
            onCapture(file)
          }
        }, 'image/jpeg', 0.9)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      onCapture(file)
    }
  }

  const handleCancel = () => {
    stopCamera()
    setPreview(null)
    onCancel?.()
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!isCapturing && !preview && (
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            onClick={startCamera}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            <Camera className="mr-2 h-5 w-5" />
            {label}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-gold text-gold hover:bg-gold hover:text-white"
            size="lg"
          >
            <ImageIcon className="mr-2 h-5 w-5" />
            Choose from Gallery
          </Button>
        </div>
      )}

      {isCapturing && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-auto max-h-[400px] object-cover"
              />
              <div className="absolute inset-0 flex items-end justify-center p-4 gap-3">
                <Button
                  onClick={capturePhoto}
                  className="bg-gold hover:bg-gold-dark text-white rounded-full h-16 w-16 shadow-lg"
                  size="lg"
                >
                  <Camera className="h-6 w-6" />
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="destructive"
                  className="rounded-full h-12 w-12"
                  size="icon"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {preview && !isCapturing && (
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Image
                src={preview}
                alt="Preview"
                width={800}
                height={400}
                className="w-full h-auto rounded-lg max-h-[400px] object-cover"
              />
              <Button
                onClick={handleCancel}
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
