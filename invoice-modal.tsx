"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"

interface Sale {
  id: string
  productName: string
  quantity: number
  unitPrice: number
  totalAmount: number
  customerName: string
  date: Date
}

interface InvoiceModalProps {
  sale: Sale | null
  isOpen: boolean
  onClose: () => void
}

export function InvoiceModal({ sale, isOpen, onClose }: InvoiceModalProps) {
  if (!sale) return null

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Simple HTML to PDF conversion
    const invoiceContent = document.getElementById("invoice-content")
    if (invoiceContent) {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice ${sale.id}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .invoice-details { margin-bottom: 20px; }
                .table { width: 100%; border-collapse: collapse; }
                .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .table th { background-color: #f2f2f2; }
                .total { font-weight: bold; font-size: 18px; }
              </style>
            </head>
            <body>
              ${invoiceContent.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invoice #{sale.id}</DialogTitle>
        </DialogHeader>

        <div id="invoice-content" className="space-y-6">
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold">INVOICE</h1>
            <p className="text-gray-600">Your Company Name</p>
            <p className="text-sm text-gray-500">123 Business Street, City, State 12345</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <p>{sale.customerName}</p>
            </div>
            <div className="text-right">
              <p>
                <strong>Invoice #:</strong> {sale.id}
              </p>
              <p>
                <strong>Date:</strong> {sale.date.toLocaleDateString()}
              </p>
            </div>
          </div>

          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-2 text-left">Product</th>
                <th className="border border-gray-300 p-2 text-right">Qty</th>
                <th className="border border-gray-300 p-2 text-right">Unit Price</th>
                <th className="border border-gray-300 p-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2">{sale.productName}</td>
                <td className="border border-gray-300 p-2 text-right">{sale.quantity}</td>
                <td className="border border-gray-300 p-2 text-right">${sale.unitPrice.toFixed(2)}</td>
                <td className="border border-gray-300 p-2 text-right">${sale.totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div className="text-right">
            <p className="text-xl font-bold">Total: ${sale.totalAmount.toFixed(2)}</p>
          </div>

          <div className="text-center text-sm text-gray-500 border-t pt-4">
            <p>Thank you for your business!</p>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
