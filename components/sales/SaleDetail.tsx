import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import PaymentForm from './PaymentForm'
import PaymentList from './PaymentList'
import { PaymentMethod } from '@prisma/client'

interface Product {
  name: string
  currentStock: number
}

interface Customer {
  name: string
  address?: string
  phone?: string
  isAccredited: boolean
}

interface Payment {
  id: string
  amount: number
  method: PaymentMethod
  reference?: string
  notes?: string
  recordedBy: string
  createdAt: string
}

interface SaleItem {
  id: string
  quantity: number
  price: number
  discount: number
  product: Product
  basePrice: number
  vatAmount: number
}

interface Sale {
  id: string
  customer: Customer
  items: SaleItem[]
  payments: Payment[]
  total: number
  basePrice: number
  vatAmount: number
  createdAt: string
  updatedAt: string
  isPaid: boolean
  isAccredited: boolean
  invoiceNumber?: string
  dueDate?: string
}

interface SaleDetailProps {
  sale: Sale & {
    payments: Payment[]
  }
}

export default function SaleDetail({ sale }: SaleDetailProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [payments, setPayments] = useState(sale.payments)
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const remaining = sale.total - totalPaid

  const handlePaymentRecorded = async () => {
    try {
      const response = await fetch(`/api/sales/${sale.id}/payments`)
      const updatedPayments = await response.json()
      setPayments(updatedPayments)
      setShowPaymentForm(false)
    } catch (error) {
      console.error('Error fetching updated payments:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Sale Details
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Customer</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {sale.customer?.name || 'Walk-in Customer'}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(sale.createdAt).toLocaleDateString()}
              </dd>
            </div>
            {sale.isAccredited && (
              <>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Invoice Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{sale.invoiceNumber}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      sale.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {sale.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </dd>
                </div>
              </>
            )}
          </dl>
        </div>
      </div>

      {sale.isAccredited && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Payment Status
              </h3>
              {!sale.isPaid && (
                <button
                  onClick={() => setShowPaymentForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Record Payment
                </button>
              )}
            </div>
          </div>
           </div>
      )}

      {showPaymentForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <PaymentForm
              saleId={sale.id}
              total={sale.total}
              totalPaid={payments.reduce((sum, p) => sum + p.amount, 0)}
              onPaymentRecorded={handlePaymentRecorded}
            />
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Items</h3>
        </div>
        <div className="border-t border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sale.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-4 text-sm text-gray-900">
                    {item.product.name}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 text-right">
                    {item.quantity}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 text-right">
                    TZS {item.price.toLocaleString()}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 text-right">
                    {item.discount > 0 ? `${item.discount}%` : '-'}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 text-right">
                    TZS {(item.basePrice + item.vatAmount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="px-3 py-4 text-sm font-medium text-gray-900 text-right">
                  Subtotal:
                </td>
                <td className="px-3 py-4 text-sm font-medium text-gray-900 text-right">
                  TZS {sale.basePrice.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="px-3 py-4 text-sm font-medium text-gray-900 text-right">
                  VAT Amount:
                </td>
                <td className="px-3 py-4 text-sm font-medium text-gray-900 text-right">
                  TZS {sale.vatAmount.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="px-3 py-4 text-sm font-bold text-gray-900 text-right">
                  Final Total:
                </td>
                <td className="px-3 py-4 text-sm font-bold text-gray-900 text-right">
                  TZS {sale.total.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {sale.isAccredited && sale.payments.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
           <PaymentList payments={sale.payments} />
        </div>
      )}
    </div>
  )
} 