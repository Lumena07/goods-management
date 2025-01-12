import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ProductList from '@/components/products/ProductList'
import Link from 'next/link'

export default function ProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session || session.user.role !== 'ADMIN') {
    router.push('/unauthorized')
    return null
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          href="/products/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          New Product
        </Link>
      </div>

        <div className="mt-8">
          <ProductList />
        </div>
      </div>
    </DashboardLayout>
  )
} 