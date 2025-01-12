import { useEffect, useState, useRef } from 'react'

interface Payment {
  id: string
  amount: number
  method: string
  createdAt: string
  reference?: string
}

interface Sale {
  id: string
  total: number
  isPaid: boolean
  createdAt: string
  items: Array<{
    quantity: number
    price: number
    product: {
      name: string
    }
  }>
  payments: Payment[]
}

interface StatementViewProps {
  customerId: string
  customerName: string
  month?: string // Format: YYYY-MM
}

interface StatementEntry {
  type: 'SALE' | 'PAYMENT'
  date: string
  saleId?: string
  description: string
  debit?: number
  credit?: number
  balance: number
}

export default function StatementView({ customerId, customerName, month }: StatementViewProps) {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(month || new Date().toISOString().slice(0, 7))
  const [statementEntries, setStatementEntries] = useState<StatementEntry[]>([])
  const statementRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (statementRef.current) {
      const printContents = statementRef.current.innerHTML
      const originalContents = document.body.innerHTML

      document.body.innerHTML = printContents
      window.print()
      document.body.innerHTML = originalContents
    }
  }

  useEffect(() => {
    const fetchStatement = async () => {
      try {
        const response = await fetch(
          `/api/customers/${customerId}/statement?month=${selectedMonth}`
        )
        const data = await response.json()
        setSales(data)
        
        // Process sales and payments into chronological entries
        const entries: StatementEntry[] = []
        let runningBalance = 0

        // Combine sales and payments into a single array and sort by date
        const allTransactions = data.flatMap((sale: Sale) => {
          const transactions = [{
            type: 'SALE' as const,
            date: sale.createdAt,
            sale,
          }]
          
          // Add payment entries
          const paymentTransactions = sale.payments.map(payment => ({
            type: 'PAYMENT' as const,
            date: payment.createdAt,
            sale,
            payment,
          }))
          
          return [...transactions, ...paymentTransactions]
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        // Create statement entries
        allTransactions.forEach(transaction => {
          if (transaction.type === 'SALE') {
            runningBalance += transaction.sale.total
            entries.push({
              type: 'SALE',
              date: transaction.sale.createdAt,
              saleId: transaction.sale.id,
              description: 'Sale',
              debit: transaction.sale.total,
              balance: runningBalance
            })
          } else {
            runningBalance -= transaction.payment.amount
            entries.push({
              type: 'PAYMENT',
              date: transaction.payment.createdAt,
              saleId: transaction.sale.id,
              description: `Payment (${transaction.payment.method})${
                transaction.payment.reference ? ` - Ref: ${transaction.payment.reference}` : ''
              }`,
              credit: transaction.payment.amount,
              balance: runningBalance
            })
          }
        })

        setStatementEntries(entries)
      } catch (error) {
        console.error('Error fetching statement:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatement()
  }, [customerId, selectedMonth])

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      {/* Controls - Only visible on screen */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Monthly Statement</h3>
        <div className="flex items-center space-x-4">
          <label htmlFor="month-select">Select Month</label>
          <input
            id="month-select"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Print Statement
          </button>
        </div>
      </div>

      {/* Statement Content - This will be printed */}
      <div ref={statementRef} className="bg-white shadow-sm rounded-lg">
        {/* Statement Header */}
        <div className="mb-6 p-6">
          <h2 className="text-2xl font-bold text-center mb-2">Statement of Account</h2>
          <div className="flex justify-between text-sm">
            <div>
              <p className="font-semibold">Customer:</p>
              <p>{customerName}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">Period:</p>
              <p>{new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Debit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {statementEntries.map((entry, index) => (
                <tr key={`${entry.saleId}-${entry.type}-${index}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(entry.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {entry.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {entry.debit ? `TZS ${entry.debit.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {entry.credit ? `TZS ${entry.credit.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    TZS {entry.balance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simplified print styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 1cm;
            size: A4;
          }
          
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          
          /* Basic table styles for print */
          table {
            width: 100%;
            border-collapse: collapse;
          }
          
          th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
        }
      `}</style>
    </div>
  )
} 