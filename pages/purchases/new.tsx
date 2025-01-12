import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PurchaseForm from '@/components/purchases/PurchaseForm'

export default function NewPurchasePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        router.push('/purchases')
      }
    } catch (error) {
      console.error('Error creating purchase:', error)
    }
  }

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
            <h1 className="text-xl font-semibold text-gray-900">New Purchase</h1>
          </div>
        </div>
        <div className="mt-8">
          <PurchaseForm onSubmit={handleSubmit} />
        </div>
      </div>
    </DashboardLayout>
  )
} 