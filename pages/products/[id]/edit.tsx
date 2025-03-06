import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import ProductForm from '@/components/ProductForm'
import DashboardLayout from '@/components/DashboardLayout'

export default function EditProductPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch product details if in edit mode
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
          setError('Failed to load product')
        } finally {
          setLoading(false)
        }
      }
      fetchProduct()
    }
  }, [id])

  // Handle product form submission (both create and update)
  const handleSubmit = async (updatedProduct: Product) => {
    setLoading(true)
    setError(null)
    try {
      const method = updatedProduct.id ? 'PUT' : 'POST'
      const url = updatedProduct.id ? `/api/products/${updatedProduct.id}` : '/api/products'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
      })

      if (!response.ok) {
        throw new Error('Failed to save product')
      }

      // Redirect after successful save
      router.push('/products')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error saving product')
    } finally {
      setLoading(false)
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
            <h1 className="text-xl font-semibold text-gray-900">{product ? 'Edit' : 'Create'} Product</h1>
          </div>
        </div>
        <div className="mt-8">
          <ProductForm
            product={product}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
