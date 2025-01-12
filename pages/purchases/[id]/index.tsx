import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'
import type { NextPage } from 'next'

interface PurchaseItem {
  id: string
  quantity: number
  received: number
  price: number
  product: {
    name: string
  }
}

interface Purchase {
  id: string
  supplier: {
    name: string
  }
  total: number
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED'
  items: PurchaseItem[]
  createdAt: string
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

  if (!session || !['ADMIN', 'INVENTORY_MANAGER'].includes(session.user.role)) {
    router.push('/unauthorized')
    return null
  }

  if (error) return <div className="text-red-600">{error}</div>
  if (!purchase) return <div>Purchase not found</div>

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Purchase Details</h1>
          </div>
          {purchase.status === 'PENDING' && (
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <Link
                href={`/purchases/${purchase.id}/receive`}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                Receive Purchase
              </Link>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Supplier</dt>
                <dd className="mt-1 text-sm text-gray-900">{purchase.supplier.name}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">{purchase.status}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Total</dt>
                <dd className="mt-1 text-sm text-gray-900">TZS {purchase.total.toLocaleString()}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(purchase.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900">Items</h3>
              <div className="mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Received
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {purchase.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {item.received || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          TZS {item.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          TZS {(item.quantity * item.price).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default PurchaseDetailPage 