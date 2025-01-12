import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Prisma } from '@prisma/client'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

type VatPreference = 'VAT_INCLUSIVE' | 'VAT_EXCLUSIVE'

interface CustomerFormProps {
  customer?: {
    id: string
    name: string
    email: string | null
    phone: string
    address: string | null
    isAccredited: boolean
    creditLimit: number | null
    vatPreference: VatPreference
  }
  onSubmit: (data: any) => void
}

export default function CustomerForm({ customer, onSubmit }: CustomerFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    isAccredited: customer?.isAccredited || false,
    creditLimit: customer?.creditLimit || 0,
    vatPreference: customer?.vatPreference || 'VAT_INCLUSIVE'
  })

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      onSubmit(formData)
    }} className="pt-8 space-y-8" data-testid="customer-form">
      <div>
        <h2 className="text-2xl font-bold">
          {customer ? 'Edit' : 'New'} Customer
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
          />
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            type="text"
            value={formData.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vatPreference">VAT Preference</Label>
        <Select
          value={formData.vatPreference}
          onValueChange={(value) => handleChange('vatPreference', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select VAT preference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="VAT_INCLUSIVE">VAT Inclusive</SelectItem>
            <SelectItem value="VAT_EXCLUSIVE">VAT Exclusive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="isAccredited">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isAccredited"
              checked={formData.isAccredited}
              onCheckedChange={(checked) => 
                handleChange('isAccredited', checked)
              }
            />
            <span>Accredited Customer</span>
          </div>
        </Label>
      </div>

      {formData.isAccredited && (
        <div className="space-y-2">
          <Label htmlFor="creditLimit">Credit Limit</Label>
          <Input
            type="number"
            id="creditLimit"
            name="creditLimit"
            value={formData.creditLimit}
            onChange={(e) => handleChange('creditLimit', parseFloat(e.target.value))}
            placeholder="Enter credit limit"
          />
        </div>
      )}

      <div className="flex justify-end space-x-4 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="default"
        >
          {customer ? 'Update' : 'Create'} Customer
        </Button>
      </div>
    </form>
  )
} 