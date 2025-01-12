import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import SupplierForm from '@/components/suppliers/SupplierForm'
import type { VatPreference } from '@/lib/utils/vat'

interface Supplier {
  id: string
  name: string
  email?: string | null
  phone: string
  address?: string | null
  vatPreference?: VatPreference
}

export default function EditSupplierPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      const fetchSupplier = async () => {
        try {
          const response = await fetch(`/api/suppliers/${id}`)
          if (!response.ok) {
            throw new Error('Failed to fetch supplier')
          }
          const data = await response.json()
          setSupplier(data)
        } catch (error) {
          console.error('Error fetching supplier:', error)
          setError('Failed to load supplier')
        } finally {
          setLoading(false)
        }
      }

      fetchSupplier()
    }
  }, [id])

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        router.push(`/suppliers/${id}`)
      }
    } catch (error) {
      console.error('Error updating supplier:', error)
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

  if (!session || session.user.role !== 'ADMIN') {
    router.push('/unauthorized')
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

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mt-8">
          {supplier && <SupplierForm 
            supplier={{
              id: supplier.id,
              name: supplier.name,
              email: supplier.email || '',
              phone: supplier.phone,
              address: supplier.address || '',
              vatPreference: (supplier.vatPreference || 'VAT_INCLUSIVE') as VatPreference
            }}
            onSubmit={handleSubmit}
          />}
        </div>
      </div>
    </DashboardLayout>
  )
} 