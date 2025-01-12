import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/components/layout/DashboardLayout'
import CustomerList from '@/components/customers/CustomerList'
import Link from 'next/link'

export default function CustomersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    router.push('/auth/login')
    return null
  }

  return (
    <DashboardLayout>
        <div className="mt-8">
          <CustomerList />
        </div>
    </DashboardLayout>
  )
} 