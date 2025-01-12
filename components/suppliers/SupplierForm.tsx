import { useState } from 'react'
import { useRouter } from 'next/router'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SupplierFormProps {
  supplier?: {
    id: string
    name: string
    email: string | null
    phone: string
    address: string
  }
}

export default function SupplierForm({ supplier }: SupplierFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    address: supplier?.address || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = supplier 
      ? `/api/suppliers/${supplier.id}`
      : '/api/suppliers'
    
    const method = supplier ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/suppliers')
      }
    } catch (error) {
      console.error('Error saving supplier:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="pt-8 space-y-8" data-testid="supplier-form">
      <div>
        <h2 className="text-2xl font-bold">
          {supplier ? 'Edit' : 'New'} Supplier
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
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="mt-1"
          />
        </div>
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
          {supplier ? 'Update' : 'Create'} Supplier
        </Button>
      </div>
    </form>
  )
} 