import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ExpenseForm from '@/components/expenses/ExpenseForm'

export default function NewExpensePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    router.push('/unauthorized')
    return null
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">New Expense</h1>
          </div>
          <div className="mt-4">
            <ExpenseForm />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 