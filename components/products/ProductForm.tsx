import { useState } from 'react'
import { useRouter } from 'next/router'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ProductFormProps {
  product?: {
    id: string
    name: string
    basePrice: number
    minStock: number
    currentStock: number
  }
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: product?.name || '',
    basePrice: product?.basePrice?.toString() || '',
    minStock: product?.minStock?.toString() || '',
    currentStock: product?.currentStock?.toString() || ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = product 
        ? `/api/products/${product.id}`
        : '/api/products'
      
      const method = product ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          basePrice: parseFloat(formData.basePrice),
          minStock: parseInt(formData.minStock),
          currentStock: parseInt(formData.currentStock)
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      router.push('/products')
    } catch (error) {
      console.error('Error saving product:', error)
      setError(error instanceof Error ? error.message : 'Error saving product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="pt-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold">
          {product ? 'Edit' : 'New'} Product
        </h2>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="basePrice">Base Price</Label>
          <Input
            id="basePrice"
            name="basePrice"
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.basePrice}
            onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="currentStock">Current Stock</Label>
          <Input
            id="currentStock"
            name="currentStock"
            type="number"
            required
            min="0"
            value={formData.currentStock}
            onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="minStock">Minimum Stock</Label>
          <Input
            id="minStock"
            name="minStock"
            type="number"
            required
            min="0"
            value={formData.minStock}
            onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
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
          disabled={loading}
        >
          {loading ? 'Saving...' : (product ? 'Update' : 'Create')} Product
        </Button>
      </div>
    </form>
  )
} 