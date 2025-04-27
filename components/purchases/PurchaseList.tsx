import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { format } from 'date-fns'

interface PurchaseItem {
  id: string
  quantity: number
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
  status: string
  items: PurchaseItem[]
  createdAt: string
}

export default function PurchaseList() {
  const { data: session } = useSession()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await fetch('/api/purchases')
        const data = await response.json()
        setPurchases(data)
      } catch (error) {
        console.error('Error fetching purchases:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPurchases()
  }, [])

  const handleDelete = async (purchaseId: string) => {
    if (!confirm('Are you sure you want to delete this purchase?')) return

    try {
      const response = await fetch(`/api/purchases/${purchaseId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPurchases(purchases.filter(purchase => purchase.id !== purchaseId))
      }
    } catch (error) {
      console.error('Error deleting purchase:', error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Purchases</h1>
        <Link
          href="/purchases/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          New Purchase
        </Link>
      </div>

      {/* Desktop view */}
      <div className="hidden md:block bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Supplier
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {purchases.map((purchase) => (
              <tr key={purchase.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(purchase.createdAt), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {purchase.supplier?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {purchase.items?.map(item => (
                    <div key={item.id}>
                      {item.product.name} ({item.quantity})
                    </div>
                  ))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  TZS {purchase.total?.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    purchase.status === 'RECEIVED' 
                      ? 'bg-green-100 text-green-800'
                      : purchase.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {purchase.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/purchases/${purchase.id}`}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    View
                  </Link>
                  {session?.user.role === 'ADMIN' && (
                    <button
                      onClick={() => handleDelete(purchase.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden space-y-4">
        {purchases.map((purchase) => (
          <div key={purchase.id} className="bg-white shadow rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="text-sm text-gray-500">
                  {format(new Date(purchase.createdAt), 'MMM d, yyyy')}
                </div>
                <div className="font-medium">
                  {purchase.supplier?.name || 'N/A'}
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                purchase.status === 'RECEIVED' 
                  ? 'bg-green-100 text-green-800'
                  : purchase.status === 'PENDING'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {purchase.status}
              </span>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              {purchase.items?.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.product.name}</span>
                  <span>Qty: {item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="text-sm font-medium">
              Total: TZS {purchase.total?.toLocaleString()}
            </div>

            <div className="flex justify-end space-x-3 pt-2 border-t">
              <Link
                href={`/purchases/${purchase.id}`}
                className="text-blue-600 hover:text-blue-900 text-sm font-medium"
              >
                View
              </Link>
              {session?.user.role === 'ADMIN' && (
                <button
                  onClick={() => handleDelete(purchase.id)}
                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 
