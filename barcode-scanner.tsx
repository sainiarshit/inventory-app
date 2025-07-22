"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Scan } from "lucide-react"
import { toast } from "sonner"

interface BarcodeScannerProps {
  isOpen: boolean
  onClose: () => void
  onScan: (barcode: string) => void
}

export function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const [manualBarcode, setManualBarcode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const startCamera = async () => {
    try {
      setIsScanning(true)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      toast.success("Camera started! Point at barcode to scan")
    } catch (error) {
      toast.error("Camera access denied or not available")
      setIsScanning(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim())
      setManualBarcode("")
      onClose()
      toast.success("Barcode entered successfully!")
    }
  }

  const handleClose = () => {
    stopCamera()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Barcode Scanner</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera Scanner */}
          <div className="text-center">
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              {isScanning ? (
                <div>
                  <video ref={videoRef} className="w-full h-48 object-cover rounded" autoPlay playsInline />
                  <Button onClick={stopCamera} className="mt-2 bg-transparent" variant="outline">
                    Stop Camera
                  </Button>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center">
                  <Camera className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-500 mb-4">Use camera to scan barcode</p>
                  <Button onClick={startCamera}>
                    <Scan className="h-4 w-4 mr-2" />
                    Start Camera
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Manual Entry */}
          <div className="border-t pt-4">
            <form onSubmit={handleManualSubmit}>
              <Label htmlFor="manual-barcode">Or enter barcode manually:</Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  id="manual-barcode"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  placeholder="Enter barcode number"
                />
                <Button type="submit">Add</Button>
              </div>
            </form>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
