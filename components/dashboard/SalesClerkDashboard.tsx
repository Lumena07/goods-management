import { useState, useEffect } from 'react'
import MetricsWidget from './widgets/MetricsWidget'
import LowStockWidget from './widgets/LowStockWidget'
import QuickActionsWidget from './widgets/QuickActionsWidget'

export default function SalesClerkDashboard() {
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalPurchases: 0
  })

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/dashboard/metrics')
        const data = await response.json()
        setMetrics(data)
      } catch (error) {
        console.error('Error fetching metrics:', error)
      }
    }

    fetchMetrics()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <MetricsWidget
        title="Total Sales"
        value={metrics.totalSales}
        type="currency"
      />
      <MetricsWidget
        title="Total Purchases"
        value={metrics.totalPurchases}
        type="currency"
      />
      <div className="md:col-span-2 lg:col-span-1">
        <QuickActionsWidget />
      </div>
      <div className="md:col-span-2 lg:col-span-3">
        <LowStockWidget />
      </div>
    </div>
  )
} 