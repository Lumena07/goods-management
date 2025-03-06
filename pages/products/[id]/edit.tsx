import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ProductForm from '@/components/products/ProductForm'

interface Product {
  id: string
  name: string
  basePrice: number
  currentStock: number
  minStock: number
}

export default function EditProductPage() {
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

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        router.push('/products')
      }
    } catch (error) {
      setError('Failed to update product')
    }
  }

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

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Edit Product</h1>
          </div>
        </div>
        <div className="mt-8">
          {product && <ProductForm product={product} onSubmit={handleSubmit} />}
        </div>
      </div>
    </DashboardLayout>
  )
} 
