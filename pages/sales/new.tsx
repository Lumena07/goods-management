import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/components/layout/DashboardLayout'
import SaleForm from '@/components/sales/SaleForm'

export default function NewSalePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    router.push('/auth/login')
    return null
  }

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        router.push('/sales')
      }
    } catch (error) {
      console.error('Error creating sale:', error)
    }
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">New Sale</h1>
          </div>
        </div>
        <div className="mt-8">
          <SaleForm onSubmit={handleSubmit} />
        </div>
      </div>
    </DashboardLayout>
  )
} 