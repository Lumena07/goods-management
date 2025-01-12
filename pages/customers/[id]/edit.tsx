import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import CustomerForm from '@/components/customers/CustomerForm'
import type { VatPreference } from '@/lib/utils/vat'

interface Customer {
  id: string
  name: string
  email?: string | null
  phone: string
  address?: string | null
  isAccredited: boolean
  creditLimit?: number | null
  vatPreference: VatPreference
}

export default function EditCustomerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      const fetchCustomer = async () => {
        try {
          const response = await fetch(`/api/customers/${id}`)
          if (!response.ok) {
            throw new Error('Failed to fetch customer')
          }
          const data = await response.json()
          setCustomer(data)
        } catch (error) {
          console.error('Error fetching customer:', error)
          setError('Failed to load customer')
        } finally {
          setLoading(false)
        }
      }

      fetchCustomer()
    }
  }, [id])

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        router.push(`/customers/${id}`)
      }
    } catch (error) {
      console.error('Error updating customer:', error)
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
          {customer && <CustomerForm 
            customer={{
              id: customer.id,
              name: customer.name,
              email: customer.email || '',
              phone: customer.phone,
              address: customer.address || '',
              isAccredited: customer.isAccredited,
              creditLimit: customer.creditLimit || 0,
              vatPreference: customer.vatPreference || 'VAT_INCLUSIVE'
            }}
            onSubmit={handleSubmit}
          />}
        </div>
      </div>
    </DashboardLayout>
  )
} 