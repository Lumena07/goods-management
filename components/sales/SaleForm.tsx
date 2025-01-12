import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button } from "@/components/ui/button"

interface Product {
  id: string
  name: string
  basePrice: number
  currentStock: number
}

interface Customer {
  id: string
  name: string
  isAccredited: boolean
  customPrices: CustomPrice[]
}

interface SaleItem {
  productId: string
  quantity: number
  price: number
  discount: number
}

interface CustomPrice {
  productId: string
  price: number
  product: {
    id: string
    name: string
    basePrice: number
  }
}

export default function SaleForm() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isAccredited, setIsAccredited] = useState(false)
  const [items, setItems] = useState<SaleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, customersRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/customers')
        ])
        const [productsData, customersData] = await Promise.all([
          productsRes.json(),
          customersRes.json()
        ])
        setProducts(productsData)
        setCustomers(customersData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddItem = () => {
    setItems([...items, { 
      productId: '', 
      quantity: 1, 
      price: 0,
      discount: 0 
    }])
  }

  const handleItemChange = async (index: number, field: keyof SaleItem, value: any) => {
    const newItems = [...items]
    if (field === 'productId') {
      const productId = value
      const product = products.find(p => p.id === productId)
      if (!product) return

      console.log('Selected customer:', selectedCustomer)
      console.log('Custom prices:', selectedCustomer?.customPrices)

      let price = product.basePrice
      if (selectedCustomer?.customPrices) {
        const customPrice = selectedCustomer.customPrices.find(
          cp => cp.productId === productId
        )
        console.log('Found custom price:', customPrice)
        if (customPrice) {
          price = customPrice.price
        }
      }

      newItems[index] = {
        ...newItems[index],
        productId,
        price,
        quantity: 1,
        discount: 0
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value }
    }
    console.log('Updated items:', newItems)
    setItems(newItems)
    calculateTotal()
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const subtotal = item.quantity * item.price
      return sum + (subtotal - (subtotal * item.discount / 100))
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId: selectedCustomer?.id || null,
          isAccredited,
          items: items.map(item => ({
            ...item,
            quantity: parseInt(item.quantity.toString()),
            price: parseFloat(item.price.toString()),
            discount: parseFloat(item.discount.toString())
          }))
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      router.push('/sales')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error creating sale')
    }
  }

  const handleCustomerChange = async (customerId: string) => {
    try {
      if (!customerId) {
        // If no customer is selected, reset to base prices
        const newItems = items.map(item => {
          const product = products.find(p => p.id === item.productId)
          return {
            ...item,
            price: product ? product.basePrice : item.price
          }
        })
        setItems(newItems)
        setSelectedCustomer(null)
        calculateTotal()
        return
      }

      const response = await fetch(`/api/customers/${customerId}`)
      if (!response.ok) throw new Error('Failed to fetch customer')
      const customer = await response.json()
      console.log('Customer data:', customer)
      setSelectedCustomer(customer)

      // Update prices for all items based on whether customer has custom prices
      const newItems = items.map(item => {
        const customPrice = customer.customPrices?.find(
          cp => cp.productId === item.productId
        )
        const product = products.find(p => p.id === item.productId)
        
        return {
          ...item,
          // Use custom price if available, otherwise use base price
          price: customPrice ? customPrice.price : (product ? product.basePrice : item.price)
        }
      })
      setItems(newItems)
      calculateTotal()
    } catch (error) {
      console.error('Error fetching customer:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Customer (Optional)
        </label>
        <select
          value={selectedCustomer?.id || ''}
          onChange={(e) => handleCustomerChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="" className="py-2 px-3">Select Customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id} className="py-2 px-3">
              {customer.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCustomer && customers.find(c => c.id === selectedCustomer.id)?.isAccredited && (
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isAccredited}
              onChange={(e) => setIsAccredited(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">
              Accredited Sale (Credit)
            </span>
          </label>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Sale Items</h3>
          <button
            type="button"
            onClick={handleAddItem}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Add Item
          </button>
        </div>

        {items.map((item, index) => (
          <div key={index} className="flex gap-4 items-end border-b pb-4">
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
                {products.map((product) => (
                  <option 
                    key={product.id} 
                    value={product.id}
                    disabled={product.currentStock <= 0}
                    className="py-2 px-3"
                  >
                    {product.name} ({product.currentStock} in stock)
                  </option>
                ))}
              </select>
            </div>

            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <input
                type="number"
                required
                min="1"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <div className="mt-1 text-sm text-gray-900">
                TZS {item.price.toLocaleString()}
              </div>
            </div>

            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700">
                Discount %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={item.discount}
                onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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

      <div className="flex flex-col items-end gap-4 pt-4">
        <div className="text-lg font-semibold">
          Total: TZS {calculateTotal().toLocaleString()}
        </div>
        <div className="space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={items.length === 0}
          >
            {items.length === 0 ? 'No items to create' : 'Create Sale'}
          </Button>
        </div>
      </div>
    </form>
  )
} 