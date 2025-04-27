import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { format } from 'date-fns'

interface SaleItem {
  id: string
  quantity: number
  price: number
  discount: number
  product: {
    name: string
  }
}

interface Sale {
  id: string
  customer?: {
    name: string
  }
  total: number
  isPaid: boolean
  isAccredited: boolean
  invoiceNumber?: string
  dueDate?: string
  items: SaleItem[]
  createdAt: string
}

export default function SaleList() {
  const { data: session } = useSession()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await fetch('/api/sales')
        const data = await response.json()
        setSales(data)
      } catch (error) {
        console.error('Error fetching sales:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSales()
  }, [])

  const handleDelete = async (saleId: string) => {
    if (!confirm('Are you sure you want to delete this sale?')) return

    try {
      const response = await fetch(`/api/sales/${saleId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete sale')
      }

      setSales(sales.filter(sale => sale.id !== saleId))
    } catch (error) {
      console.error('Error deleting sale:', error)
      alert(error instanceof Error ? error.message : 'Error deleting sale')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sales</h1>
        <Link
          href="/sales/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          New Sale
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
                Customer
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
            {sales.map((sale) => (
              <tr key={sale.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(sale.createdAt), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {sale.customer?.name || 'Walk-in Customer'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {sale.items.map((item, index) => (
                    <div key={item.id}>
                      {item.product.name} ({item.quantity})
                      {item.discount > 0 && ` (-${item.discount}%)`}
                    </div>
                  ))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  TZS {sale.total.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      sale.isPaid 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {sale.isPaid ? 'Paid' : 'Pending'}
                    </span>
                    {sale.isAccredited && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Credit
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/sales/${sale.id}`}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    View
                  </Link>
                  {session?.user.role === 'ADMIN' && (
                    <button
                      onClick={() => handleDelete(sale.id)}
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
        {sales.map((sale) => (
          <div key={sale.id} className="bg-white shadow rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="text-sm text-gray-500">
                  {format(new Date(sale.createdAt), 'MMM d, yyyy')}
                </div>
                <div className="font-medium">
                  {sale.customer?.name || 'Walk-in Customer'}
                </div>
              </div>
              <div className="flex flex-col space-y-1">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  sale.isPaid 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {sale.isPaid ? 'Paid' : 'Pending'}
                </span>
                {sale.isAccredited && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    Credit
                  </span>
                )}
              </div>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              {sale.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.product.name}
                    {item.discount > 0 && ` (-${item.discount}%)`}
                  </span>
                  <span>Qty: {item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="text-sm font-medium">
              Total: TZS {sale.total.toLocaleString()}
            </div>

            <div className="flex justify-end space-x-3 pt-2 border-t">
              <Link
                href={`/sales/${sale.id}`}
                className="text-blue-600 hover:text-blue-900 text-sm font-medium"
              >
                View
              </Link>
              {session?.user.role === 'ADMIN' && (
                <button
                  onClick={() => handleDelete(sale.id)}
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
