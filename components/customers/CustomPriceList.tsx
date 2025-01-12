import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface CustomPrice {
  id: string
  productId: string
  price: number
  product: {
    name: string
    basePrice: number
  }
}

interface CustomPriceListProps {
  customerId: string
}

export default function CustomPriceList({ customerId }: CustomPriceListProps) {
  const { data: session } = useSession()
  const [customPrices, setCustomPrices] = useState<CustomPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [newPrice, setNewPrice] = useState({
    productId: '',
    price: ''
  })
  const [products, setProducts] = useState<Array<{ id: string, name: string }>>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pricesRes, productsRes] = await Promise.all([
          fetch(`/api/customers/${customerId}/prices`),
          fetch('/api/products')
        ])
        
        const [prices, products] = await Promise.all([
          pricesRes.json(),
          productsRes.json()
        ])

        setCustomPrices(prices)
        setProducts(products)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [customerId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`/api/customers/${customerId}/prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: newPrice.productId,
          price: parseFloat(newPrice.price)
        })
      })

      if (response.ok) {
        const price = await response.json()
        setCustomPrices([...customPrices, price])
        setNewPrice({ productId: '', price: '' })
      }
    } catch (error) {
      console.error('Error adding custom price:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}/prices/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCustomPrices(customPrices.filter(price => price.id !== id))
      }
    } catch (error) {
      console.error('Error deleting custom price:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Custom Prices</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Custom Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customPrices.map((price) => (
                <tr key={price.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {price.product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    TZS {price.product.basePrice.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    TZS {price.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {session?.user.role === 'ADMIN' && (
                      <button
                        onClick={() => handleDelete(price.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {session?.user.role === 'ADMIN' && (
        <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label htmlFor="product" className="block text-sm font-medium text-gray-700">
                Product
              </label>
              <select
                id="product"
                name="product"
                required
                data-testid="product-select"
                value={newPrice.productId}
                onChange={(e) => setNewPrice({ ...newPrice, productId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700"
              >
                Price
              </label>
              <input
                id="price"
                type="number"
                required
                value={newPrice.price}
                onChange={(e) => setNewPrice({ ...newPrice, price: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Add Custom Price
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
} 