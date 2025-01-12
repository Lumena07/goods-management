import { useState } from 'react'
import { format } from 'date-fns'

type ReportType = 'sales' | 'purchases' | 'stock' | 'customers'

interface ReportGeneratorProps {
  onGenerate: (type: ReportType, filters: any) => void
  loading: boolean
}

export default function ReportGenerator({ onGenerate, loading }: ReportGeneratorProps) {
  const [reportType, setReportType] = useState<ReportType>('sales')
  const [filters, setFilters] = useState({
    startDate: format(new Date().setDate(1), 'yyyy-MM-dd'), // First day of current month
    endDate: format(new Date(), 'yyyy-MM-dd'),
    status: '',
    category: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGenerate(reportType, filters)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700">Report Type</label>
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value as ReportType)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="sales">Sales Report</option>
          <option value="purchases">Purchase Report</option>
          <option value="stock">Stock Level Report</option>
          <option value="customers">Customer Credit Report</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {reportType !== 'stock' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              {reportType === 'purchases' && <option value="received">Received</option>}
            </select>
          </div>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>
    </form>
  )
} 