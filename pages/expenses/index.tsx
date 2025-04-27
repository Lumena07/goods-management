import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ExpenseList from '@/components/expenses/ExpenseList'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function ExpensesPage() {
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">Expenses</h1>
            <Link
              href="/expenses/new"
              className="w-full sm:w-auto flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Expense
            </Link>
          </div>
          <div className="mt-6">
            <ExpenseList />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 