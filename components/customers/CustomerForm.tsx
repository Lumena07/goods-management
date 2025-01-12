import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface CustomerFormProps {
  customer?: {
    id: string
    name: string
    email: string | null
    phone: string
    address: string | null
    isAccredited: boolean
    creditLimit: number | null
  }
}

interface CustomerFormData {
  name: string
  email?: string
  phone: string
  address?: string
  isAccredited: boolean
  creditLimit?: number
}

export default function CustomerForm({ customer }: CustomerFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    isAccredited: customer?.isAccredited || false,
    creditLimit: customer?.creditLimit?.toString() || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = customer 
      ? `/api/customers/${customer.id}`
      : '/api/customers'
    
    const method = customer ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : null
        })
      })

      if (response.ok) {
        router.push('/customers')
      }
    } catch (error) {
      console.error('Error saving customer:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="pt-8 space-y-8" data-testid="customer-form">
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
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            type="text"
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isAccredited"
            checked={formData.isAccredited}
            onCheckedChange={(checked) => 
              setFormData({ ...formData, isAccredited: checked as boolean })
            }
          />
          <Label 
            htmlFor="isAccredited"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Accredited for Credit Sales
          </Label>
        </div>

        {formData.isAccredited && (
          <div className="w-1/2">
            <Label htmlFor="creditLimit">Credit Limit</Label>
            <Input
              id="creditLimit"
              type="number"
              required={formData.isAccredited}
              value={formData.creditLimit}
              onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
              className="mt-1"
            />
          </div>
        )}
      </div>

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