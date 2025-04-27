import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'
import type { NextPage } from 'next'
import { format } from 'date-fns'

interface PurchaseItem {
  id: string
  quantity: number
  received: number
  price: number
  product: {
    name: string
  }
}

interface Supplier {
  id: string
  name: string
}

interface Purchase {
  id: string
  total: number
  status: string
  isPaid: boolean
  createdAt: string
  supplier: Supplier
  items: PurchaseItem[]
}

const PurchaseDetailPage: NextPage = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      fetchPurchase()
    }
  }, [id])

  const fetchPurchase = async () => {
    try {
      const response = await fetch(`/api/purchases/${id}`)
      if (!response.ok) throw new Error('Failed to fetch purchase')
      const data = await response.json()
      setPurchase(data)
    } catch (error) {
      setError('Error loading purchase details')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return <div>Loading...</div>
  }

  if (!session || !['ADMIN', 'SALES_CLERK', 'INVENTORY_MANAGER'].includes(session.user.role)) {
    router.push('/unauthorized')
    return null
  }

  if (error) return <div className="text-red-600">{error}</div>
  if (!purchase) return <div>Purchase not found</div>

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Purchase Details</h1>
          {purchase.status === 'PENDING' && (
            <Link
              href={`/purchases/${purchase.id}/receive`}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Receive Purchase
            </Link>
          )}
        </div>

        {/* Purchase Info Card */}
        <div className="mt-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Supplier</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">{purchase.supplier.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                      purchase.status === 'COMPLETED' 
                        ? 'bg-green-100 text-green-800'
                        : purchase.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {purchase.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    TZS {purchase.total.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {format(new Date(purchase.createdAt), 'MMM d, yyyy')}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items Card */}
        <div className="mt-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
              
              {/* Desktop View */}
              <div className="hidden sm:block">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th className="py-3.5 text-left text-sm font-semibold text-gray-900">Product</th>
                      <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Quantity</th>
                      <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Received</th>
                      <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Price</th>
                      <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {purchase.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-4 text-sm text-gray-900">{item.product.name}</td>
                        <td className="px-3 py-4 text-sm text-gray-900 text-right">{item.quantity}</td>
                        <td className="px-3 py-4 text-sm text-gray-900 text-right">{item.received || 0}</td>
                        <td className="px-3 py-4 text-sm text-gray-900 text-right">TZS {item.price.toLocaleString()}</td>
                        <td className="px-3 py-4 text-sm text-gray-900 text-right">TZS {(item.quantity * item.price).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="sm:hidden space-y-4">
                {purchase.items.map((item) => (
                  <div key={item.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                    <h4 className="text-base font-medium text-gray-900 mb-2">{item.product.name}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt className="text-gray-500">Quantity</dt>
                        <dd className="font-medium text-gray-900">{item.quantity}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Received</dt>
                        <dd className="font-medium text-gray-900">{item.received || 0}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Price</dt>
                        <dd className="font-medium text-gray-900">TZS {item.price.toLocaleString()}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Subtotal</dt>
                        <dd className="font-medium text-gray-900">TZS {(item.quantity * item.price).toLocaleString()}</dd>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default PurchaseDetailPage 
