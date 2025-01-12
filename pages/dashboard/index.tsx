import { useSession } from 'next-auth/react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import AdminDashboard from '../../components/dashboard/AdminDashboard'
import SalesClerkDashboard from '../../components/dashboard/SalesClerkDashboard'

export default function Dashboard() {
  const { data: session } = useSession()

  return (
    <DashboardLayout>
      {session?.user?.role === 'ADMIN' ? (
        <AdminDashboard />
      ) : (
        <SalesClerkDashboard />
      )}
    </DashboardLayout>
  )
} 