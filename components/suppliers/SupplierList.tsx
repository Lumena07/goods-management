import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Supplier {
  id: string
  name: string
  email: string | null
  phone: string
  address: string
  prices: {
    id: string
    price: number
    product: {
      name: string
      basePrice: number
    }
  }[]
}

export default function SupplierList() {
  const router = useRouter()
  const { data: session } = useSession()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch('/api/suppliers')
        const data = await response.json()
        setSuppliers(data)
      } catch (error) {
        console.error('Error fetching suppliers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSuppliers()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return

    try {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuppliers(suppliers.filter(supplier => supplier.id !== id))
      }
    } catch (error) {
      console.error('Error deleting supplier:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
        {session?.user.role === 'ADMIN' && (
          <Link
            href="/suppliers/new"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Add Supplier
          </Link>
        )}
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {suppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {supplier.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div>{supplier.email}</div>
                  <div>{supplier.phone}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <ul className="list-disc list-inside">
                    {supplier.prices.map((price) => (
                      <li key={price.id}>
                        {price.product.name} @ TZS {price.price.toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/suppliers/${supplier.id}`}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    View
                  </Link>
                  {session?.user.role === 'ADMIN' && (
                    <>
                      <Link
                        href={`/suppliers/${supplier.id}/prices`}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Manage Prices
                      </Link>
                      <button
                        onClick={() => handleDelete(supplier.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 