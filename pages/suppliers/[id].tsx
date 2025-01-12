import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'

interface Purchase {
  id: string
  total: number
  isPaid: boolean
  createdAt: string
}

interface Supplier {
  id: string
  name: string
  email?: string
  phone: string
  address?: string
  purchases: Purchase[]
}

export default function SupplierDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      fetchSupplier()
    }
  }, [id])

  const handleTogglePayment = async (purchaseId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/purchases/${purchaseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isPaid: !currentStatus })
      })

      if (response.ok) {
        // Refresh supplier data to show updated status
        fetchSupplier()
      }
    } catch (error) {
      console.error('Error updating payment status:', error)
    }
  }

  const fetchSupplier = async () => {
    try {
      const response = await fetch(`/api/suppliers/${id}`)
      if (!response.ok) throw new Error('Failed to fetch supplier')
      const data = await response.json()
      setSupplier(data)
    } catch (error) {
      setError('Error loading supplier details')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <div className="text-gray-600">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session) {
    router.push('/auth/login')
    return null
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!supplier) return null

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{supplier.name}</h1>
            </div>
            <div className="mt-4 sm:mt-0">
              {session.user.role === 'ADMIN' && (
                <Link
                  href={`/suppliers/${supplier.id}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Edit Supplier
                </Link>
              )}
            </div>
          </div>

          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Supplier Information
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{supplier.email || 'N/A'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{supplier.phone}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">{supplier.address || 'N/A'}</dd>
                </div>
              </dl>
            </div>
          </div>

          {supplier.purchases.length > 0 && (
            <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Purchases
                </h3>
              </div>
              <div className="border-t border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {supplier.purchases.map((purchase) => (
                      <tr key={purchase.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(purchase.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          TZS {purchase.total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span 
                            onClick={() => session?.user.role === 'ADMIN' && handleTogglePayment(purchase.id, purchase.isPaid)}
                            className={`px-3 py-1 inline-flex items-center text-sm font-medium rounded-md ${
                              purchase.isPaid
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            } ${session?.user.role === 'ADMIN' ? 'cursor-pointer hover:bg-opacity-75 transition-colors duration-150' : ''}`}
                          >
                            <span className={`w-2 h-2 rounded-full mr-2 ${purchase.isPaid ? 'bg-green-400' : 'bg-red-400'}`}></span>
                            {purchase.isPaid ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/purchases/${purchase.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
} 