import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatementView from '@/components/customers/StatementView'

interface Customer {
  id: string
  name: string
}

export default function CustomerStatementPage() {
  const router = useRouter()
  const { id } = router.query
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      const fetchCustomer = async () => {
        try {
          const response = await fetch(`/api/customers/${id}`)
          if (!response.ok) throw new Error('Customer not found')
          const data = await response.json()
          setCustomer(data)
        } catch (error) {
          console.error('Error fetching customer:', error)
          router.push('/customers')
        } finally {
          setLoading(false)
        }
      }

      fetchCustomer()
    }
  }, [id, router])

  if (loading || !customer) return <div>Loading...</div>

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StatementView 
          customerId={customer.id} 
          customerName={customer.name}
        />
      </div>
    </DashboardLayout>
  )
} 