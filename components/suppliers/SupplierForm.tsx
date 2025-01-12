import { useState } from 'react'
import { useRouter } from 'next/router'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { VatPreference } from '@/lib/utils/vat'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface SupplierFormProps {
  supplier?: {
    id: string
    name: string
    email: string | null
    phone: string
    address: string | null
    vatPreference: VatPreference
  }
  onSubmit: (data: any) => void
}

export default function SupplierForm({ supplier, onSubmit }: SupplierFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    address: supplier?.address || '',
    vatPreference: supplier?.vatPreference || 'VAT_INCLUSIVE'
  })

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      onSubmit(formData)
    }} className="pt-8 space-y-8" data-testid="supplier-form">
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