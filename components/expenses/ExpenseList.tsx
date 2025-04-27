import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import {
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface Expense {
  id: string
  amount: number
  category: 'SALARY' | 'ELECTRICITY' | 'RENT' | 'TRANSPORT' | 'OTHER'
  description: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  user: { name: string }
  approver?: { name: string }
}

export default function ExpenseList() {
  const { data: session } = useSession()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/expenses')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error('Expected array of expenses, received:', data)
        setExpenses([])
        setError('Invalid data format received from server')
        return
      }

      setExpenses(data)
    } catch (error) {
      console.error('Error fetching expenses:', error)
      setError('Failed to load expenses')
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/expenses/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        const updatedExpense = await response.json()
        setExpenses(expenses.map(expense => 
          expense.id === id ? updatedExpense : expense
        ))
      }
    } catch (error) {
      console.error('Error updating expense:', error)
    }
  }

  const getStatusBadge = (status: Expense['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-4 h-4 mr-1" />
            Pending
          </span>
        )
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            Approved
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="w-4 h-4 mr-1" />
            Rejected
          </span>
        )
    }
  }

  if (loading) return <div className="text-center py-4">Loading...</div>
  if (error) return <div className="text-center py-4 text-red-600">{error}</div>
  if (!expenses.length) return <div className="text-center py-4">No expenses found</div>

  return (
    <div className="space-y-6">
      {/* Desktop View */}
      <div className="hidden sm:block">
        <table className="min-w-full divide-y divide-gray-200 bg-white shadow-sm rounded-lg">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created By
              </th>
              {session?.user.role === 'ADMIN' && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(expense.createdAt), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {expense.category}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {expense.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  TZS {expense.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {getStatusBadge(expense.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {expense.user.name}
                </td>
                {session?.user.role === 'ADMIN' && expense.status === 'PENDING' && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleApprove(expense.id, 'APPROVED')}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApprove(expense.id, 'REJECTED')}
                      className="text-red-600 hover:text-red-900"
                    >
                      Reject
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden space-y-4">
        {expenses.map((expense) => (
          <div key={expense.id} className="bg-white shadow-sm rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center">
                  <BanknotesIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-lg font-semibold text-gray-900">
                    TZS {expense.amount.toLocaleString()}
                  </span>
                </div>
                
                <div className="mt-2 space-y-1">
                  <div className="text-sm text-gray-500">
                    Category: <span className="text-gray-900">{expense.category}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Description: <span className="text-gray-900">{expense.description}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Date: <span className="text-gray-900">{format(new Date(expense.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Created by: <span className="text-gray-900">{expense.user.name}</span>
                  </div>
                  <div className="mt-2">
                    {getStatusBadge(expense.status)}
                  </div>
                </div>
              </div>
            </div>

            {session?.user.role === 'ADMIN' && expense.status === 'PENDING' && (
              <div className="mt-4 flex justify-end space-x-4">
                <button
                  onClick={() => handleApprove(expense.id, 'APPROVED')}
                  className="text-green-600 text-sm font-medium hover:text-green-900"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleApprove(expense.id, 'REJECTED')}
                  className="text-red-600 text-sm font-medium hover:text-red-900"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 