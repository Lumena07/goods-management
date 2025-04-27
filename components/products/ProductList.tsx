import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { CubeIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'

interface Product {
  id: string
  name: string
  basePrice: number
  currentStock: number
  minStock: number
}

export default function ProductList() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        const data = await response.json()
        setProducts(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching products:', error)
        setError('Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProducts(products.filter(product => product.id !== productId))
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-red-600">{error}</div>
  }

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        {session?.user.role === 'ADMIN' && (
          <Link
            href="/products/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Product
          </Link>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Base Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  TZS {product.basePrice.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={product.currentStock <= product.minStock ? 'text-red-600' : ''}>
                    {product.currentStock}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/products/${product.id}`}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    View
                  </Link>
                  {session?.user.role === 'ADMIN' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden divide-y divide-gray-200">
        {products.map((product) => (
          <div key={product.id} className="px-4 py-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CubeIcon className="h-5 w-5 text-gray-400 mr-2" />
                  {product.name}
                </h3>
                <div className="mt-2 space-y-1">
                  <div className="text-sm">
                    <span className="text-gray-500">Base Price:</span>{' '}
                    <span className="text-lg font-semibold text-gray-900">TZS {product.basePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500">Stock:</span>
                    <span className={`ml-2 text-lg font-semibold ${
                      product.currentStock <= product.minStock ? 'text-red-600 flex items-center' : 'text-gray-900'
                    }`}>
                      {product.currentStock}
                      {product.currentStock <= product.minStock && (
                        <ExclamationCircleIcon className="h-4 w-4 ml-1 text-red-600" />
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-4">
              <Link
                href={`/products/${product.id}`}
                className="text-indigo-600 text-sm font-medium hover:text-indigo-900"
              >
                View Details
              </Link>
              {session?.user.role === 'ADMIN' && (
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-red-600 text-sm font-medium hover:text-red-900"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 
