"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Image as ImageIcon, Camera } from "lucide-react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { CameraCapture } from "./CameraCapture"

interface ImageUploadProps {
  onUpload: (files: File[]) => void
  multiple?: boolean
  maxFiles?: number
  label?: string
  accept?: string
}

export function ImageUpload({
  onUpload,
  multiple = false,
  maxFiles = 5,
  label = "Upload Images",
  accept = "image/*"
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([])
  const [showCamera, setShowCamera] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const newPreviews: string[] = []
      const filesToAdd = multiple ? files.slice(0, maxFiles - previews.length) : [files[0]]
      
      filesToAdd.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          newPreviews.push(reader.result as string)
          if (newPreviews.length === filesToAdd.length) {
            const updatedPreviews = multiple ? [...previews, ...newPreviews] : newPreviews
            setPreviews(updatedPreviews)
            onUpload(filesToAdd)
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleCameraCapture = (file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const updatedPreviews = multiple ? [...previews, reader.result as string] : [reader.result as string]
      setPreviews(updatedPreviews)
      onUpload([file])
    }
    reader.readAsDataURL(file)
    setShowCamera(false)
  }

  const removeImage = (index: number) => {
    const updatedPreviews = previews.filter((_, i) => i !== index)
    setPreviews(updatedPreviews)
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          onClick={() => setShowCamera(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          <Camera className="mr-2 h-5 w-5" />
          Take Photo
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-gold text-gold hover:bg-gold hover:text-white"
          size="lg"
        >
          <Upload className="mr-2 h-5 w-5" />
          {label}
        </Button>
      </div>

      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onCancel={() => setShowCamera(false)}
          label="Capture Photo"
        />
      )}

      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-0">
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  width={200}
                  height={128}
                  className="w-full h-32 object-cover"
                />
                <Button
                  onClick={() => removeImage(index)}
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {multiple && previews.length >= maxFiles && (
        <p className="text-sm text-muted-foreground text-center">
          Maximum {maxFiles} images reached
        </p>
      )}
    </div>
  )
}
