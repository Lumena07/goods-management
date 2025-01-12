import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PurchaseReceive from '@/components/purchases/PurchaseReceive'

export default function ReceivePurchasePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session || !['ADMIN'].includes(session.user.role)) {
    router.push('/unauthorized')
    return null
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Receive Purchase</h1>
          </div>
        </div>
        <div className="mt-8">
          <PurchaseReceive />
        </div>
      </div>
    </DashboardLayout>
  )
} 