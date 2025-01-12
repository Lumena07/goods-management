import { useState } from 'react'
import { useSession } from 'next-auth/react'

interface Product {
  id: string
  name: string
}

interface SupplierPrice {
  id: string
  productId: string
  price: number
  product: Product
}

interface SupplierPriceListProps {
  supplierId: string
  prices: SupplierPrice[]
}

export default function SupplierPriceList({ supplierId, prices: initialPrices }: SupplierPriceListProps) {
  const { data: session } = useSession()
  const [prices, setPrices] = useState(initialPrices)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [newPrice, setNewPrice] = useState({
    productId: '',
    price: ''
  })

  // Fetch available products when adding new price
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/suppliers/${supplierId}/prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrice)
      })

      if (response.ok) {
        const data = await response.json()
        setPrices([...prices, data])
        setNewPrice({ productId: '', price: '' })
      }
    } catch (error) {
      console.error('Error adding price:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this price?')) return

    try {
      const response = await fetch(`/api/suppliers/${supplierId}/prices/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPrices(prices.filter(price => price.id !== id))
      }
    } catch (error) {
      console.error('Error deleting price:', error)
    }
  }

  return (
    <div>
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Product Prices</h3>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {prices.map((price) => (
              <tr key={price.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {price.product.name}
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

      {session?.user.role === 'ADMIN' && (
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="product" className="block text-sm font-medium text-gray-700">
                Product
              </label>
              <select
                id="product"
                required
                value={newPrice.productId}
                onChange={(e) => setNewPrice({ ...newPrice, productId: e.target.value })}
                onClick={() => !products.length && fetchProducts()}
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
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
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
          </div>

          <div className="mt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              Add Price
            </button>
          </div>
        </form>
      )}
    </div>
  )
} 