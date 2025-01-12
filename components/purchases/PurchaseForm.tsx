import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

interface Supplier {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  basePrice: number
}

interface PurchaseItem {
  productId: string
  quantity: number
  price: number
}

interface SupplierPrice {
  productId: string
  price: number
  product: {
    name: string
  }
}

export default function PurchaseForm() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [supplierPrices, setSupplierPrices] = useState<SupplierPrice[]>([])
  const [items, setItems] = useState<PurchaseItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersRes, productsRes] = await Promise.all([
          fetch('/api/suppliers'),
          fetch('/api/products')
        ])
        const [suppliersData, productsData] = await Promise.all([
          suppliersRes.json(),
          productsRes.json()
        ])
        setSuppliers(suppliersData)
        setProducts(productsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (selectedSupplier) {
      const fetchPrices = async () => {
        try {
          const response = await fetch(`/api/suppliers/${selectedSupplier}/prices`)
          const data = await response.json()
          setSupplierPrices(Array.isArray(data) ? data : [])
        } catch (error) {
          console.error('Error fetching supplier prices:', error)
          setSupplierPrices([])
        }
      }
      fetchPrices()
    } else {
      setSupplierPrices([])
    }
  }, [selectedSupplier])

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1, price: 0 }])
  }

  const handleItemChange = (index: number, field: keyof PurchaseItem, value: any) => {
    const newItems = [...items]
    if (field === 'productId') {
      const supplierPrice = supplierPrices.find(sp => sp.productId === value)
      newItems[index] = {
        ...newItems[index],
        [field]: value,
        price: supplierPrice?.price || 0
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value }
    }
    setItems(newItems)
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          supplierId: selectedSupplier,
          items: items.map(item => ({
            ...item,
            quantity: parseInt(item.quantity.toString()),
            price: parseFloat(item.price.toString())
          }))
        })
      })

      if (response.ok) {
        router.push('/purchases')
      }
    } catch (error) {
      console.error('Error creating purchase:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Supplier
        </label>
        <select
          required
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="" className="py-2 px-3">Select Supplier</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id} className="py-2 px-3">
              {supplier.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Items</h3>
          <button
            type="button"
            onClick={handleAddItem}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Item
          </button>
        </div>

        {items.map((item, index) => (
          <div key={index} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Product
              </label>
              <select
                required
                value={item.productId}
                onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="" className="py-2 px-3">Select Product</option>
                {supplierPrices.map(sp => (
                  <option key={sp.productId} value={sp.productId} className="py-2 px-3">
                    {sp.product.name} - TZS {sp.price}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <input
                type="number"
                required
                min="1"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={item.price}
                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              className="text-red-600 hover:text-red-900"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Create Purchase
        </button>
      </div>
    </form>
  )
} 