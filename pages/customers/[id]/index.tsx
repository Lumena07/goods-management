import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'

interface Customer {
  id: string
  name: string
  email?: string
  phone: string
  address?: string
  isAccredited: boolean
  creditLimit?: number
  sales: Array<{
    id: string
    total: number
    isPaid: boolean
    isAccredited: boolean
    invoiceNumber?: string
    createdAt: string
    items: Array<{
      product: {
        name: string
      }
      quantity: number
      price: number
      discount: number
    }>
    payments: Array<{
      id: string
      amount: number
      method: string
      createdAt: string
    }>
  }>
  customPrices: Array<{
    id: string
    price: number
    product: {
      name: string
      basePrice: number
    }
  }>
}

export default function CustomerDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      fetchCustomer()
    }
  }, [id])

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${id}`)
      if (!response.ok) throw new Error('Failed to fetch customer')
      const data = await response.json()
      setCustomer(data)
    } catch (error) {
      setError('Error loading customer details')
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

  if (!customer) return null

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            </div>
            <div className="mt-4 sm:mt-0 space-x-3">
              <Link
                href={`/customers/${customer.id}/statement`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                View Statement
              </Link>
              <Link
                href={`/customers/${customer.id}/prices`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                 Set Custom Prices
              </Link>
              {session.user.role === 'ADMIN' && (
                <Link
                  href={`/customers/${customer.id}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Edit Customer
                </Link>
              )}
            </div>
          </div>

          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Customer Information
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{customer.email || 'N/A'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{customer.phone}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">{customer.address || 'N/A'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Account Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {customer.isAccredited ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Credit Account
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Cash Account
                      </span>
                    )}
                  </dd>
                </div>
                {customer.isAccredited && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Credit Limit</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      TZS {customer.creditLimit?.toLocaleString() || 'N/A'}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Custom Prices
              </h3>
            </div>
            <div className="border-t border-gray-200">
              {customer.customPrices.length === 0 ? (
                <div className="px-4 py-5 sm:px-6 text-gray-500 text-sm">
                  No custom prices set
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customer.customPrices.map((price) => (
                      <tr key={price.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {price.product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          TZS {price.price.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
     </div>
    </DashboardLayout>
  )
} 