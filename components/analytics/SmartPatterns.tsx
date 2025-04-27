import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Pattern {
  productId: string
  productName: string
  currentStock: number
  minStock: number
  totalSales: number
  averageMonthly: number
  seasonalTrends: Array<{ month: number, average: number }>
  reorderPoint: number
  predictedDemand: number
  stockStatus: 'REORDER_NEEDED' | 'OK'
  recommendations: string[]
}

interface Summary {
  totalProducts: number
  needsReorder: number
  topSellers: Pattern[]
}

export default function SmartPatterns() {
  const [loading, setLoading] = useState(true)
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPatterns()
  }, [])

  const fetchPatterns = async () => {
    try {
      const response = await fetch('/api/analytics/patterns')
      if (!response.ok) throw new Error('Failed to fetch patterns')
      const data = await response.json()
      setPatterns(data.patterns)
      setSummary(data.summary)
    } catch (err) {
      setError('Error loading analytics')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-4">Loading analytics...</div>
  if (error) return <div className="text-red-600 py-4">{error}</div>

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Products Overview</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">{summary?.totalProducts}</p>
          <p className="text-sm text-gray-500">Total Products Tracked</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Reorder Alerts</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">{summary?.needsReorder}</p>
          <p className="text-sm text-gray-500">Products Need Reordering</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Top Sellers</h3>
          <ul className="mt-2 space-y-1">
            {summary?.topSellers.slice(0, 3).map(product => (
              <li key={product.productId} className="text-sm">
                {product.productName} ({product.totalSales} units)
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Product Analysis */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">Product Analysis</h2>
        </div>
        <div className="p-4">
          <div className="space-y-6">
            {patterns.map(pattern => (
              <div key={pattern.productId} className="border-b pb-6 last:border-b-0 last:pb-0">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{pattern.productName}</h3>
                
                {/* Stock Status */}
                <div className="flex items-center mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${pattern.stockStatus === 'REORDER_NEEDED' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {pattern.stockStatus === 'REORDER_NEEDED' ? 'Reorder Needed' : 'Stock OK'}
                  </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Current Stock</p>
                    <p className="text-lg font-semibold">{pattern.currentStock}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Reorder Point</p>
                    <p className="text-lg font-semibold">{pattern.reorderPoint}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Monthly Average</p>
                    <p className="text-lg font-semibold">{Math.round(pattern.averageMonthly)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Predicted Demand</p>
                    <p className="text-lg font-semibold">{pattern.predictedDemand}</p>
                  </div>
                </div>

                {/* Seasonal Trends Chart */}
                <div className="h-48 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={pattern.seasonalTrends.map(trend => ({
                        month: monthNames[trend.month],
                        average: Math.round(trend.average)
                      }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="average" stroke="#3B82F6" name="Monthly Average" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Recommendations */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {pattern.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 