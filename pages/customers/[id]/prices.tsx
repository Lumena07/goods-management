import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface Product {
  id: string
  name: string
  basePrice: number
}

interface CustomPrice {
  id: string
  productId: string
  price: number
  product: {
    name: string
    basePrice: number
  }
}

interface Customer {
  id: string
  name: string
  customPrices: CustomPrice[]
}

export default function CustomerPricesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [customer, setCustomer] = useState<Customer | null>({
    id: '',
    name: '',
    customPrices: []
  })
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      fetchCustomer()
      fetchProducts()
    }
  }, [id])

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${id}`)
      if (!response.ok) throw new Error('Failed to fetch customer')
      const data = await response.json()
      setCustomer(data)
    } catch (error) {
      setError('Error loading customer details')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (!response.ok) throw new Error('Failed to fetch products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct || !customPrice) return

    try {
      const response = await fetch(`/api/customers/${id}/prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProduct,
          price: parseFloat(customPrice),
        }),
      })

      if (!response.ok) throw new Error('Failed to set custom price')
      
      fetchCustomer() // Refresh customer data
      setSelectedProduct('')
      setCustomPrice('')
    } catch (error) {
      console.error('Error setting custom price:', error)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to remove this custom price?')) return

    try {
      const response = await fetch(`/api/customers/${id}/prices/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete custom price')
      
      fetchCustomer() // Refresh customer data
    } catch (error) {
      console.error('Error deleting custom price:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <div className="text-gray-600">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session || !['ADMIN'].includes(session.user.role)) {
    router.push('/unauthorized')
    return null
  }

  if (!customer) return null

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Custom Prices - {customer.name}
            </h1>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Back
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="product" className="block text-sm font-medium text-gray-700">
                    Product
                  </label>
                  <select
                    id="product"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} (Base: TZS {product.basePrice.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Custom Price (TZS)
                  </label>
                  <input
                    type="number"
                    id="price"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Set Price
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Price
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Custom Price
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customer.customPrices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No custom prices set
                  </td>
                </tr>
              ) : (
                customer.customPrices.map((price) => (
                  <tr key={price.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {price.product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      TZS {price.product.basePrice.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      TZS {price.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(price.productId)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
} 