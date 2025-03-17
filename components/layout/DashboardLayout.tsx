import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import Sidebar from '../layout/Sidebar'
import Header from '../layout/Header'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={setIsSidebarCollapsed} />
      <div className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        <Header />
        <main className="p-6 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  )
} 