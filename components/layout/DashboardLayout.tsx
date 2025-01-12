import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Sidebar from '../layout/Sidebar'
import Header from '../layout/Header'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
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
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  )
} 