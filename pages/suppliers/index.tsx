import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/components/layout/DashboardLayout'
import SupplierList from '@/components/suppliers/SupplierList'
import Link from 'next/link'

export default function SuppliersPage() {
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
        <div className="mt-8">
          <SupplierList />
        </div>
    </DashboardLayout>
  )
} 