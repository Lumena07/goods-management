import { useState } from 'react'
import { useRouter } from 'next/router'
import { format } from 'date-fns'

interface Invoice {
  id: string
  invoiceNumber: string
  customer: {
    name: string
  }
  total: number
  isPaid: boolean
  dueDate: string
  createdAt: string
}

interface InvoiceListProps {
  invoices: Invoice[]
}

export default function InvoiceList({ invoices: initialInvoices }: InvoiceListProps) {
  const router = useRouter()
  const [invoices, setInvoices] = useState(initialInvoices)
  const [filters, setFilters] = useState({
    status: '',
    customer: '',
    startDate: '',
    endDate: ''
  })

  const handleFilterChange = async (newFilters: typeof filters) => {
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })

    try {
      const response = await fetch(`/api/invoices?${params.toString()}`)
      const data = await response.json()
      setInvoices(data)
    } catch (error) {
      console.error('Error fetching invoices:', error)
    }
  }

  const handleDownload = async (id: string) => {
    try {
      const response = await fetch(`/api/invoices/${id}/download`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading invoice:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => {
                const newFilters = { ...filters, status: e.target.value }
                setFilters(newFilters)
                handleFilterChange(newFilters)
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Customer Name
            </label>
            <input
              type="text"
              value={filters.customer}
              onChange={(e) => {
                const newFilters = { ...filters, customer: e.target.value }
                setFilters(newFilters)
                handleFilterChange(newFilters)
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => {
                const newFilters = { ...filters, startDate: e.target.value }
                setFilters(newFilters)
                handleFilterChange(newFilters)
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => {
                const newFilters = { ...filters, endDate: e.target.value }
                setFilters(newFilters)
                handleFilterChange(newFilters)
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {invoice.invoiceNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {invoice.customer.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(invoice.createdAt), 'dd/MM/yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(invoice.dueDate), 'dd/MM/yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  TZS {invoice.total.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    invoice.isPaid 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => router.push(`/sales/${invoice.id}`)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDownload(invoice.id)}
                    className="text-green-600 hover:text-green-900"
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 