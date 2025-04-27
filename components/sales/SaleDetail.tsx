import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import PaymentForm from './PaymentForm'
import PaymentList from './PaymentList'
import { PaymentMethod } from '@prisma/client'
import { format } from 'date-fns'

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
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Customer</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {sale.customer?.name || 'Walk-in Customer'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Date</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {format(new Date(sale.createdAt), 'MMM d, yyyy')}
              </dd>
            </div>
            {sale.isAccredited && (
              <>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Invoice Number</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">{sale.invoiceNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                      sale.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {sale.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    TZS {sale.total.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Amount Paid</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    TZS {totalPaid.toLocaleString()}
                  </dd>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {sale.isAccredited && (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Payment Status</h3>
              {!sale.isPaid && (
                <button
                  onClick={() => setShowPaymentForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Record Payment
                </button>
              )}
            </div>
            {payments.length > 0 && <PaymentList payments={payments} />}
          </div>
        </div>
      )}

      {showPaymentForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <PaymentForm
              saleId={sale.id}
              total={sale.total}
              totalPaid={totalPaid}
              onPaymentRecorded={handlePaymentRecorded}
            />
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
          
          {/* Desktop View */}
          <div className="hidden sm:block">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th className="py-3.5 text-left text-sm font-semibold text-gray-900">Product</th>
                  <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Quantity</th>
                  <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Price</th>
                  <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Discount</th>
                  <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sale.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-4 text-sm text-gray-900">{item.product.name}</td>
                    <td className="px-3 py-4 text-sm text-gray-900 text-right">{item.quantity}</td>
                    <td className="px-3 py-4 text-sm text-gray-900 text-right">
                      TZS {item.price.toLocaleString()}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-900 text-right">
                      {item.discount > 0 ? `${item.discount}%` : '-'}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-900 text-right">
                      TZS {((item.quantity * item.price) * (1 - item.discount / 100)).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-gray-300">
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-sm font-medium text-gray-900 text-right">
                    Subtotal:
                  </td>
                  <td className="px-3 py-4 text-sm font-semibold text-gray-900 text-right">
                    TZS {sale.basePrice.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-sm font-medium text-gray-900 text-right">
                    VAT Amount:
                  </td>
                  <td className="px-3 py-4 text-sm font-semibold text-gray-900 text-right">
                    TZS {sale.vatAmount.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-sm font-semibold text-gray-900 text-right">
                    Total Amount:
                  </td>
                  <td className="px-3 py-4 text-lg font-semibold text-gray-900 text-right">
                    TZS {sale.total.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile View */}
          <div className="sm:hidden space-y-4">
            {sale.items.map((item) => (
              <div key={item.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                <h4 className="text-base font-medium text-gray-900 mb-2">{item.product.name}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500">Quantity</dt>
                    <dd className="font-medium text-gray-900">{item.quantity}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Price</dt>
                    <dd className="font-medium text-gray-900">TZS {item.price.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Discount</dt>
                    <dd className="font-medium text-gray-900">
                      {item.discount > 0 ? `${item.discount}%` : '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Total</dt>
                    <dd className="font-medium text-gray-900">
                      TZS {((item.quantity * item.price) * (1 - item.discount / 100)).toLocaleString()}
                    </dd>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Summary for mobile */}
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Subtotal:</span>
                <span className="text-sm font-semibold text-gray-900">TZS {sale.basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">VAT Amount:</span>
                <span className="text-sm font-semibold text-gray-900">TZS {sale.vatAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm font-semibold text-gray-900">Total Amount:</span>
                <span className="text-lg font-semibold text-gray-900">TZS {sale.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
