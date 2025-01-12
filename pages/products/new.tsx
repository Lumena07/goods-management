import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ProductForm from '@/components/products/ProductForm'

export default function NewProductPage() {
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
        <div className="mt-8">
          <ProductForm />
        </div>
      </div>
    </DashboardLayout>
  )
} 