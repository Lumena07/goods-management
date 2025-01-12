import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'
interface Product {
  id: string
  name: string
  basePrice: number
  currentStock: number
  minStock: number
 
}

export default function ProductDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const response = await fetch(`/api/products/${id}`)
          if (!response.ok) {
            throw new Error('Failed to fetch product')
          }
          const data = await response.json()
          setProduct(data)
        } catch (error) {
          console.error('Error fetching product:', error)
          setError('Failed to load product')
        } finally {
          setLoading(false)
        }
      }

      fetchProduct()
    }
  }, [id])

  if (status === 'loading' || loading) {
    return <div>Loading...</div>
  }

  if (!session || session.user.role !== 'ADMIN') {
    router.push('/unauthorized')
    return null
  }

  if (error) {
    return <div className="text-red-600">{error}</div>
  }

  if (!product) {
    return <div>Product not found</div>
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Product Details</h1>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link
              href={`/products/${product.id}/edit`}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              Edit Product
            </Link>
          </div>
        </div>
        <div className="mt-8">
          <div className="overflow-hidden bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">{product.name}</h3>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Base Price</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                    TZS {product.basePrice.toLocaleString()}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Current Stock</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                    <span className={product.currentStock <= product.minStock ? 'text-red-600' : ''}>
                      {product.currentStock}
                    </span>
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Minimum Stock</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">{product.minStock}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 