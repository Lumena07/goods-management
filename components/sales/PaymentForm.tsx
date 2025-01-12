import { useState } from 'react'
import { PaymentMethod } from '@prisma/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface PaymentFormProps {
  saleId: string
  total: number
  totalPaid: number
  onPaymentRecorded: () => void
}

export default function PaymentForm({ 
  saleId, 
  total, 
  totalPaid, 
  onPaymentRecorded 
}: PaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    amount: '',
    method: 'CASH' as PaymentMethod,
    reference: '',
    notes: ''
  })

  const remaining = total - totalPaid

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/sales/${saleId}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      setFormData({
        amount: '',
        method: 'CASH' as PaymentMethod,
        reference: '',
        notes: ''
      })
      onPaymentRecorded()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error recording payment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md">
              <p>{error}</p>
            </div>
          )}

          <div className="grid gap-2">
            <div className="text-sm text-muted-foreground">
              <p>Total Amount: TZS {total.toLocaleString()}</p>
              <p>Amount Paid: TZS {totalPaid.toLocaleString()}</p>
              <p>Remaining: TZS {remaining.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Payment Amount</label>
            <Input
              type="number"
              required
              min="0.01"
              max={remaining}
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Payment Method</label>
            <Select
              value={formData.method}
              onValueChange={(value) => setFormData({ ...formData, method: value as PaymentMethod })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PaymentMethod).map((method) => (
                  <SelectItem key={method} value={method}>
                    {method.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.method !== PaymentMethod.CASH && (
            <div className="grid gap-2">
              <label className="text-sm font-medium">Reference Number</label>
              <Input
                type="text"
                required
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              />
            </div>
          )}

          <div className="grid gap-2">
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !formData.amount || parseFloat(formData.amount) > remaining}
            className="w-full"
          >
            {isSubmitting ? 'Recording...' : 'Record Payment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 