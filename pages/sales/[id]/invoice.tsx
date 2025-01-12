import type { NextPage } from 'next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Invoice from '@/components/sales/Invoice'

interface SaleInvoice {
  id: string
  invoiceNumber: string
  createdAt: string
  dueDate: string
  customer: {
    name: string
    address?: string
  }
  items: {
    product: {
      name: string
    }
    quantity: number
    price: number
    discount: number
  }[]
  total: number
}

// You should move this to an environment variable or configuration file
const companyInfo = {
  name: "Your Company Name",
  address: "123 Business Street, Dar es Salaam, Tanzania",
  phone: "+255 123 456 789",
  email: "contact@company.com",
  website: "www.company.com"
}

const InvoicePage: NextPage = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [sale, setSale] = useState<SaleInvoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      fetchSale()
    }
  }, [id])

  const fetchSale = async () => {
    try {
      const response = await fetch(`/api/sales/${id}`)
      if (response.status === 404) {
        setError('Sale not found')
        return
      }
      if (!response.ok) throw new Error('Failed to fetch sale')
      
      const data = await response.json()
      
      // Check if this is an accredited sale with invoice
      if (!data.isAccredited || !data.invoiceNumber) {
        setError('This sale does not have an invoice')
        return
      }
      
      setSale(data)
    } catch (error) {
      setError('Error loading sale details')
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
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-800"
            >
              &larr; Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!sale) return null

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800"
          >
            &larr; Back to Sale
          </button>
        </div>
        
        <Invoice 
          sale={sale}
          companyInfo={companyInfo}
        />
      </div>
    </DashboardLayout>
  )
}

export default InvoicePage 