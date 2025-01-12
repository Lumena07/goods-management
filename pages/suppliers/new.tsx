import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/components/layout/DashboardLayout'
import SupplierForm from '@/components/suppliers/SupplierForm'

export default function NewSupplierPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        router.push('/suppliers')
      }
    } catch (error) {
      console.error('Error creating supplier:', error)
    }
  }

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
          <SupplierForm onSubmit={handleSubmit} />
        </div>
      </div>
    </DashboardLayout>
  )
} 