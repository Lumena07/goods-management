import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/components/layout/DashboardLayout'
import CustomerForm from '@/components/customers/CustomerForm'

export default function NewCustomerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        router.push('/customers')
      }
    } catch (error) {
      console.error('Error creating customer:', error)
    }
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    router.push('/auth/login')
    return null
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mt-8">
          <CustomerForm onSubmit={handleSubmit} />
        </div>
      </div>
    </DashboardLayout>
  )
} 