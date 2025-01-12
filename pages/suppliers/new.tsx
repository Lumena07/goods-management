import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/components/layout/DashboardLayout'
import SupplierForm from '@/components/suppliers/SupplierForm'

export default function NewSupplierPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session || !['ADMIN', 'INVENTORY_MANAGER'].includes(session.user.role)) {
    router.push('/unauthorized')
    return null
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mt-8">
          <SupplierForm />
        </div>
      </div>
    </DashboardLayout>
  )
} 