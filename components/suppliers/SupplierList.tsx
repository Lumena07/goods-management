import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { BuildingOfficeIcon, EnvelopeIcon, PhoneIcon, TagIcon } from '@heroicons/react/24/outline'

interface Supplier {
  id: string
  name: string
  email: string | null
  phone: string
  address: string
  vatPreference: 'VAT_INCLUSIVE' | 'VAT_EXCLUSIVE'
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
        <h1 className="text-2xl font-semibold text-gray-900">Suppliers</h1>
        {session?.user.role === 'ADMIN' && (
          <Link
            href="/suppliers/new"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Add Supplier
          </Link>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block bg-white shadow-sm rounded-lg overflow-hidden">
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
                VAT
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th className="w-48 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    supplier.vatPreference === 'VAT_INCLUSIVE' 
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {supplier.vatPreference === 'VAT_INCLUSIVE' ? 'Inclusive' : 'Exclusive'}
                  </span>
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

      {/* Mobile View */}
      <div className="sm:hidden divide-y divide-gray-200 bg-white shadow-sm rounded-lg">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
                  {supplier.name}
                </h3>
                
                <div className="mt-2 space-y-1">
                  {supplier.email && (
                    <div className="flex items-center text-sm">
                      <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{supplier.email}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{supplier.phone}</span>
                  </div>
                  <div className="flex items-center text-sm mt-2">
                    <TagIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      supplier.vatPreference === 'VAT_INCLUSIVE'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      VAT {supplier.vatPreference === 'VAT_INCLUSIVE' ? 'Inclusive' : 'Exclusive'}
                    </span>
                  </div>
                </div>

                {supplier.prices.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Products</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {supplier.prices.map((price) => (
                        <li key={price.id} className="flex justify-between">
                          <span>{price.product.name}</span>
                          <span className="font-semibold text-gray-900">
                            TZS {price.price.toLocaleString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-4">
              <Link
                href={`/suppliers/${supplier.id}`}
                className="text-blue-600 text-sm font-medium hover:text-blue-900"
              >
                View Details
              </Link>
              {session?.user.role === 'ADMIN' && (
                <>
                  <Link
                    href={`/suppliers/${supplier.id}/prices`}
                    className="text-green-600 text-sm font-medium hover:text-green-900"
                  >
                    Manage Prices
                  </Link>
                  <button
                    onClick={() => handleDelete(supplier.id)}
                    className="text-red-600 text-sm font-medium hover:text-red-900"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 
